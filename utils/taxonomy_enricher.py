import hashlib
import json
import time
import xml.etree.ElementTree as ET

import requests

from config import settings

_session = requests.Session()


# ---- Target invasive species: GBIF ----

def match_species(name: str) -> dict:
    resp = _session.get(settings.GBIF_MATCH_URL, params={"name": name, "verbose": "true"}, timeout=15)
    resp.raise_for_status()
    time.sleep(settings.GBIF_REQUEST_DELAY_SECONDS)
    return resp.json()


def get_synonyms(usage_key: int) -> list:
    url = settings.GBIF_SYNONYMS_URL.format(usage_key=usage_key)
    names, offset = [], 0
    while True:
        resp = _session.get(url, params={"limit": 100, "offset": offset}, timeout=15)
        resp.raise_for_status()
        payload = resp.json()
        names.extend(r["canonicalName"] for r in payload.get("results", []) if r.get("canonicalName"))
        if payload.get("endOfRecords", True):
            break
        offset += 100
    time.sleep(settings.GBIF_REQUEST_DELAY_SECONDS)
    return names


def resolve_target_invasive(name: str) -> dict:
    match = match_species(name)
    match_type = match.get("matchType", "NONE")
    confidence = match.get("confidence", 0)
    usage_key = match.get("usageKey")
    accepted_key = match.get("acceptedUsageKey")
    low_confidence = match_type == "NONE" or (
        match_type == "FUZZY" and confidence < settings.GBIF_LOW_CONFIDENCE_THRESHOLD
    )

    if usage_key and not low_confidence:
        canonical_key = accepted_key or usage_key
        canonical_name = match.get("canonicalName") or match.get("scientificName") or name
        synonym_cloud = get_synonyms(usage_key)
        return {
            "fingerprint": f"usageKey:{canonical_key}",
            "source": "GBIF",
            "canonical_name": canonical_name,
            "genus": match.get("genus", ""),
            "family": match.get("family", ""),
            "order": match.get("order", ""),
            "synonym_cloud": sorted(set(synonym_cloud + [canonical_name])),
            "match_type": match_type,
            "confidence": confidence,
        }

    alt_names = {name}
    for alt in match.get("alternatives", []):
        if alt.get("canonicalName"):
            alt_names.add(alt["canonicalName"])
    synonym_cloud = sorted(alt_names)
    digest = hashlib.sha256(json.dumps(synonym_cloud).encode()).hexdigest()[:16]
    return {
        "fingerprint": f"synhash:{digest}",
        "source": "GBIF",
        "canonical_name": match.get("canonicalName") or name,
        "genus": match.get("genus", ""),
        "family": match.get("family", ""),
        "order": match.get("order", ""),
        "synonym_cloud": synonym_cloud,
        "match_type": match_type,
        "confidence": confidence,
    }


# ---- Microbe of interest: NCBI Taxonomy ----

def _ncbi_params(extra: dict) -> dict:
    params = dict(extra)
    if settings.NCBI_EMAIL:
        params["email"] = settings.NCBI_EMAIL
    params["tool"] = settings.NCBI_TOOL
    return params


def _ncbi_find_taxid(name: str):
    resp = _session.get(settings.NCBI_ESEARCH_URL, params=_ncbi_params({
        "db": "taxonomy", "term": name, "retmode": "json",
    }), timeout=15)
    resp.raise_for_status()
    time.sleep(settings.NCBI_REQUEST_DELAY_SECONDS)
    ids = resp.json().get("esearchresult", {}).get("idlist", [])
    return ids[0] if ids else None


def resolve_microbe_ncbi(name: str) -> dict:
    taxid = _ncbi_find_taxid(name)
    if not taxid:
        digest = hashlib.sha256(name.encode()).hexdigest()[:16]
        return {
            "fingerprint": f"synhash:{digest}",
            "source": "NCBI",
            "canonical_name": name,
            "genus": "", "family": "", "order": "",
            "synonym_cloud": [name],
            "match_type": "NONE",
            "confidence": 0,
        }

    resp = _session.get(settings.NCBI_EFETCH_URL, params=_ncbi_params({
        "db": "taxonomy", "id": taxid, "retmode": "xml",
    }), timeout=15)
    resp.raise_for_status()
    time.sleep(settings.NCBI_REQUEST_DELAY_SECONDS)

    taxon = ET.fromstring(resp.text).find("Taxon")
    canonical_name = taxon.findtext("ScientificName") or name

    ranks = {}
    for lineage_taxon in taxon.findall("./LineageEx/Taxon"):
        rank, sci_name = lineage_taxon.findtext("Rank"), lineage_taxon.findtext("ScientificName")
        if rank and sci_name:
            ranks[rank] = sci_name

    synonyms = {canonical_name, name}
    for syn in taxon.findall("./OtherNames/Synonym"):
        if syn.text:
            synonyms.add(syn.text)

    return {
        "fingerprint": f"ncbi:{taxid}",
        "source": "NCBI",
        "canonical_name": canonical_name,
        "genus": ranks.get("genus", ""),
        "family": ranks.get("family", ""),
        "order": ranks.get("order", ""),
        "synonym_cloud": sorted(synonyms),
        "match_type": "EXACT",
        "confidence": 100,
    }
