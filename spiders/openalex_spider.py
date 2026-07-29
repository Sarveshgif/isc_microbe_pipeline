import json
from urllib.parse import urlencode

import scrapy

from config import settings
from models.extraction_shapes import resolve_taxonomic_proximity
from sheets_infra.sheets_handler import SheetsHandler
from services.llm_analyzer import extract_fields
from utils.index_reconstructor import reconstruct_abstract

MAX_TIER = 4


class OpenAlexSpider(scrapy.Spider):
    name = "openalex"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.handler = SheetsHandler()
        self.doi_cache = self.handler.load_doi_cache()
        self.sent_pairs = self.handler.load_sent_pairs()

    async def start(self):
        for row in self.handler.get_unprocessed_staging_rows():
            request = self._next_request(row, row["current_search_tier"])
            if request:
                yield request

    def _tier_buildable(self, row: dict, tier: int) -> bool:
        if tier == 1:
            return True
        if tier == 2:
            return bool(row.get("target_genus"))
        if tier == 3:
            return bool(row.get("target_family"))
        return bool(row.get("target_genus") or row.get("target_family"))

    def _next_request(self, row: dict, tier: int):
        while tier <= MAX_TIER and not self._tier_buildable(row, tier):
            tier += 1
        if tier > MAX_TIER:
            self.handler.mark_staging_resolved(row["_row_number"], MAX_TIER, "NO_RELATION_FOUND")
            return None
        if tier != row["current_search_tier"]:
            self.handler.update_staging_tier(row["_row_number"], tier)
            row["current_search_tier"] = tier
        params = {"search": self._build_tier_query(row, tier), "per_page": settings.OPENALEX_MAX_WORKS}
        if settings.OPENALEX_MAILTO:
            params["mailto"] = settings.OPENALEX_MAILTO
        url = f"{settings.OPENALEX_WORKS_URL}?{urlencode(params)}"
        return scrapy.Request(
            url, callback=self.parse_tier, errback=self.handle_error, meta={"staging_row": row, "tier": tier}
        )

    def _build_tier_query(self, row: dict, tier: int) -> str:
        microbe_terms = " OR ".join(f'"{s}"' for s in row["microbe_synonym_cloud"]) or f'"{row["microbe_resolved_name"]}"'
        microbe_clause = f"({microbe_terms})"

        if tier == 1:
            target_terms = " OR ".join(f'"{s}"' for s in row["target_synonym_cloud"]) or f'"{row["target_name"]}"'
            return f"{microbe_clause} AND ({target_terms}) AND {settings.INTERACTION_KEYWORD_CLAUSE}"
        if tier == 2:
            return f'{microbe_clause} AND "{row["target_genus"]}" AND {settings.INTERACTION_KEYWORD_CLAUSE}'
        if tier == 3:
            return f'{microbe_clause} AND "{row["target_family"]}" AND {settings.INTERACTION_KEYWORD_CLAUSE}'
        target_broad = " OR ".join(f'"{v}"' for v in (row["target_genus"], row["target_family"]) if v)
        return f"{microbe_clause} AND ({target_broad}) AND {settings.OPENALEX_BIOACTIVITY_CLAUSE}"

    async def parse_tier(self, response):
        row = response.meta["staging_row"]
        tier = response.meta["tier"]
        works = json.loads(response.text).get("results", [])[: settings.OPENALEX_MAX_WORKS]

        if not works:
            request = self._next_request(row, tier + 1)
            if request:
                yield request
            return

        pair_key = row["pair_key"]
        found_any = False

        for work in works:
            doi = work.get("doi") or ""
            if not doi or (pair_key, doi) in self.sent_pairs:
                continue

            if doi in self.doi_cache:
                abstract_text = self.doi_cache[doi]
            else:
                abstract_text = reconstruct_abstract(work.get("abstract_inverted_index") or {})
                self.doi_cache[doi] = abstract_text
                try:
                    self.handler.append_doi_cache_entries([(doi, abstract_text)])
                except Exception as exc:
                    self.logger.error(f"DOI cache write failed for doi={doi}: {exc}")

            if not abstract_text:
                continue

            title = work.get("title") or ""
            source_url = (work.get("primary_location") or {}).get("landing_page_url") or doi

            fields = await extract_fields(abstract_text, title, row["microbe_resolved_name"], row["target_name"])
            if fields is None:
                continue
            self.sent_pairs.add((pair_key, doi))

            taxonomic_proximity = resolve_taxonomic_proximity(
                fields.matched_subject_in_text, row["target_name"], row["target_synonym_cloud"],
                row["target_genus"], row["target_family"],
            )

            record_id = f"{pair_key}:{doi}".replace("/", "_")
            production_row = {
                "id": record_id,
                "paper_name": title,
                "doi": doi,
                "source_url": source_url,
                "microbe_of_interest": {
                    "isc_id": row["microbe_isc_id"],
                    "genus": row["microbe_genus"],
                    "species": row["microbe_species"],
                    "strain": row["microbe_strain"],
                },
                "target_invasive_profile": row["target_name"],
                "matched_subject_in_text": fields.matched_subject_in_text,
                "taxonomic_proximity": taxonomic_proximity,
                "matched_via_tier": tier,
                "active_molecules_identified": fields.active_molecules_identified,
                "bioactivity_category": fields.bioactivity_category,
                "evidence_quote": fields.evidence_quote,
                "analyst_inference": fields.analyst_inference,
                "impact_severity": fields.impact_severity,
            }
            try:
                self.handler.append_production_rows([production_row])
                self.handler.append_sent_pairs([(pair_key, doi)])
                found_any = True
            except Exception as exc:
                self.logger.error(f"Production write failed for pair_key={pair_key} doi={doi}: {exc}")

        try:
            if found_any:
                self.handler.mark_staging_resolved(row["_row_number"], tier, "FOUND")
            else:
                request = self._next_request(row, tier + 1)
                if request:
                    yield request
        except Exception as exc:
            self.logger.error(f"Staging status update failed for pair_key={pair_key}: {exc}")

    def handle_error(self, failure):
        row = failure.request.meta.get("staging_row", {})
        self.logger.error(f"Request failed for pair_key={row.get('pair_key')}: {failure.value}")
