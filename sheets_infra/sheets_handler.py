import json

import gspread
from google.oauth2.service_account import Credentials

from config import settings

_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

_STAGING_HEADERS = [
    "pair_key", "microbe_isc_id", "microbe_genus", "microbe_species", "microbe_strain",
    "microbe_resolved_name", "microbe_source", "microbe_family", "microbe_order", "microbe_synonym_cloud",
    "target_name", "target_source", "target_genus", "target_family", "target_order", "target_synonym_cloud",
    "source_pairs", "current_search_tier", "resolution_status", "is_processed",
]
_PRODUCTION_HEADERS = [
    "microbe_isc_id", "id", "paper_name", "doi", "source_url", "microbe_of_interest",
    "target_invasive_profile", "matched_subject_in_text", "taxonomic_proximity", "matched_via_tier",
    "active_molecules_identified", "bioactivity_category", "evidence_quote", "analyst_inference",
    "impact_severity",
]
_DOI_CACHE_HEADERS = ["doi", "reconstructed_text"]
_PAIR_DOI_SENT_HEADERS = ["pair_key", "doi"]


class SheetsHandler:
    def __init__(self):
        creds = Credentials.from_service_account_file(settings.GOOGLE_SERVICE_ACCOUNT_FILE, scopes=_SCOPES)
        client = gspread.authorize(creds)
        self._book = client.open_by_key(settings.GOOGLE_SHEET_ID)
        self.staging = self._get_or_create_worksheet(settings.STAGING_WORKSHEET, _STAGING_HEADERS)
        self.production = self._get_or_create_worksheet(settings.PRODUCTION_WORKSHEET, _PRODUCTION_HEADERS)
        self.doi_cache = self._get_or_create_worksheet(settings.DOI_CACHE_WORKSHEET, _DOI_CACHE_HEADERS)
        self.pair_doi_sent = self._get_or_create_worksheet(
            settings.PAIR_DOI_SENT_WORKSHEET, _PAIR_DOI_SENT_HEADERS
        )

    def _get_or_create_worksheet(self, title, headers):
        try:
            ws = self._book.worksheet(title)
        except gspread.WorksheetNotFound:
            ws = self._book.add_worksheet(title=title, rows=1000, cols=len(headers))
            ws.append_row(headers)
            return ws
        if not ws.row_values(1):
            ws.append_row(headers)
        return ws

    # ---- Phase 1: staging writes ----
    def get_existing_staging_keys(self) -> set:
        return {row["pair_key"] for row in self.staging.get_all_records() if row.get("pair_key")}

    def append_staging_rows(self, rows: list):
        if not rows:
            return
        values = [[
            r["pair_key"], r["microbe_isc_id"], r["microbe_genus"], r["microbe_species"], r["microbe_strain"],
            r["microbe_resolved_name"], r["microbe_source"], r["microbe_family"], r["microbe_order"],
            json.dumps(r["microbe_synonym_cloud"]), r["target_name"], r["target_source"], r["target_genus"],
            r["target_family"], r["target_order"], json.dumps(r["target_synonym_cloud"]),
            json.dumps(r["source_pairs"]), 1, "PENDING", "False",
        ] for r in rows]
        self.staging.append_rows(values, value_input_option="RAW")

    # ---- Phase 2/4: staging reads + tier progress ----
    def get_unprocessed_staging_rows(self) -> list:
        records = self.staging.get_all_records()
        rows = []
        for idx, rec in enumerate(records, start=2):
            if str(rec.get("is_processed")) == "False":
                rec["_row_number"] = idx
                rec["microbe_synonym_cloud"] = json.loads(rec.get("microbe_synonym_cloud") or "[]")
                rec["target_synonym_cloud"] = json.loads(rec.get("target_synonym_cloud") or "[]")
                rec["current_search_tier"] = int(rec.get("current_search_tier") or 1)
                rows.append(rec)
        return rows

    def update_staging_tier(self, row_number: int, tier: int):
        self.staging.update_cell(row_number, _STAGING_HEADERS.index("current_search_tier") + 1, tier)

    def mark_staging_resolved(self, row_number: int, tier: int, status: str):
        self.staging.update_cell(row_number, _STAGING_HEADERS.index("current_search_tier") + 1, tier)
        self.staging.update_cell(row_number, _STAGING_HEADERS.index("resolution_status") + 1, status)
        self.staging.update_cell(row_number, _STAGING_HEADERS.index("is_processed") + 1, "True")

    # ---- Global seen-DOI cache ----
    def load_doi_cache(self) -> dict:
        return {row["doi"]: row["reconstructed_text"] for row in self.doi_cache.get_all_records() if row.get("doi")}

    def append_doi_cache_entries(self, entries: list):
        if not entries:
            return
        self.doi_cache.append_rows([[doi, text] for doi, text in entries], value_input_option="RAW")

    # ---- Pair-DOI combinations already sent through Phase 4 ----
    def load_sent_pairs(self) -> set:
        return {(row["pair_key"], row["doi"]) for row in self.pair_doi_sent.get_all_records()}

    def append_sent_pairs(self, pairs: list):
        if not pairs:
            return
        self.pair_doi_sent.append_rows([[k, d] for k, d in pairs], value_input_option="RAW")

    # ---- Production ----
    def append_production_rows(self, rows: list):
        if not rows:
            return
        values = [[
            r["microbe_of_interest"]["isc_id"], r["id"], r["paper_name"], r["doi"], r["source_url"],
            json.dumps(r["microbe_of_interest"]), r["target_invasive_profile"], r["matched_subject_in_text"],
            r["taxonomic_proximity"], r["matched_via_tier"], json.dumps(r["active_molecules_identified"]),
            r["bioactivity_category"], r["evidence_quote"], r["analyst_inference"], r["impact_severity"],
        ] for r in rows]
        self.production.append_rows(values, value_input_option="RAW")
