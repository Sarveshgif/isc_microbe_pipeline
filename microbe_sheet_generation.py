import csv
import json
import os

from config import settings
from sheets_infra.sheets_handler import SheetsHandler
from utils.taxonomy_enricher import resolve_microbe_ncbi, resolve_target_invasive


def _load_checkpoint() -> dict:
    if os.path.exists(settings.TAXONOMY_CHECKPOINT_PATH):
        with open(settings.TAXONOMY_CHECKPOINT_PATH) as f:
            return json.load(f)
    return {"microbes": {}, "targets": {}}


def _save_checkpoint(checkpoint: dict):
    os.makedirs(os.path.dirname(settings.TAXONOMY_CHECKPOINT_PATH), exist_ok=True)
    with open(settings.TAXONOMY_CHECKPOINT_PATH, "w") as f:
        json.dump(checkpoint, f)


def _read_raw_pairs() -> list:
    with open(settings.INPUT_CSV_PATH, newline="") as f:
        pairs = []
        for row in csv.DictReader(f):
            isc_id = (row.get("isc_id") or "").strip()
            genus = (row.get("genus") or "").strip()
            species = (row.get("species") or "").strip()
            strain = (row.get("strain") or "").strip()
            target_name = (row.get("target_name") or "").strip()
            if genus:
                pairs.append({
                    "isc_id": isc_id, "genus": genus, "species": species,
                    "strain": strain, "target_name": target_name,
                })
        return pairs


def _microbe_query_name(genus: str, species: str) -> str:
    return f"{genus} {species}".strip() if species else genus


def _microbe_key(pair: dict) -> str:
    return pair["isc_id"] or f"{pair['genus']}|{pair['species']}|{pair['strain']}"


def resolve_all(pairs: list) -> dict:
    checkpoint = _load_checkpoint()
    for pair in pairs:
        microbe_key = _microbe_key(pair)
        if microbe_key not in checkpoint["microbes"]:
            query_name = _microbe_query_name(pair["genus"], pair["species"])
            try:
                checkpoint["microbes"][microbe_key] = resolve_microbe_ncbi(query_name)
            except Exception as exc:
                checkpoint["microbes"][microbe_key] = {"error": str(exc)}
            _save_checkpoint(checkpoint)

        if pair["target_name"] and pair["target_name"] not in checkpoint["targets"]:
            try:
                checkpoint["targets"][pair["target_name"]] = resolve_target_invasive(pair["target_name"])
            except Exception as exc:
                checkpoint["targets"][pair["target_name"]] = {"error": str(exc)}
            _save_checkpoint(checkpoint)
    return checkpoint


def group_by_pair_key(pairs: list, checkpoint: dict) -> dict:
    grouped = {}
    for pair in pairs:
        microbe_key = _microbe_key(pair)
        microbe = checkpoint["microbes"].get(microbe_key)
        if not microbe or "error" in microbe:
            continue

        target = checkpoint["targets"].get(pair["target_name"]) if pair["target_name"] else None
        target_valid = bool(target) and "error" not in target
        pair_key = f"{microbe_key}|{target['fingerprint']}" if target_valid else f"{microbe_key}|NO_TARGET"

        row = grouped.setdefault(pair_key, {
            "pair_key": pair_key,
            "microbe_isc_id": pair["isc_id"],
            "microbe_genus": pair["genus"],
            "microbe_species": pair["species"],
            "microbe_strain": pair["strain"],
            "microbe_resolved_name": microbe["canonical_name"],
            "microbe_source": microbe["source"],
            "microbe_family": microbe["family"],
            "microbe_order": microbe["order"],
            "microbe_synonym_cloud": set(),
            "target_name": target["canonical_name"] if target_valid else "",
            "target_source": target["source"] if target_valid else "",
            "target_genus": target["genus"] if target_valid else "",
            "target_family": target["family"] if target_valid else "",
            "target_order": target["order"] if target_valid else "",
            "target_synonym_cloud": set(),
            "source_pairs": [],
        })
        row["microbe_synonym_cloud"].update(microbe["synonym_cloud"])
        if target_valid:
            row["target_synonym_cloud"].update(target["synonym_cloud"])
        row["source_pairs"].append([pair["isc_id"], pair["target_name"]])

    for row in grouped.values():
        row["microbe_synonym_cloud"] = sorted(row["microbe_synonym_cloud"])
        row["target_synonym_cloud"] = sorted(row["target_synonym_cloud"])
    return grouped


def main():
    pairs = _read_raw_pairs()
    checkpoint = resolve_all(pairs)
    grouped = group_by_pair_key(pairs, checkpoint)

    handler = SheetsHandler()
    existing_keys = handler.get_existing_staging_keys()
    new_rows = [row for key, row in grouped.items() if key not in existing_keys]
    handler.append_staging_rows(new_rows)
    print(f"Resolved {len(pairs)} raw pairs into {len(grouped)} canonical pairs, staged {len(new_rows)} new rows.")


if __name__ == "__main__":
    main()
