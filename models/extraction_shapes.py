import re
from typing import List, Literal

from pydantic import BaseModel, Field

TaxonomicProximity = Literal[
    "Exact Match", "Genus-Level Relative", "Family-Level Relative", "Bioactivity Match (No Taxonomic Reference)"
]


def _contains_term(text: str, term: str) -> bool:
    if not term:
        return False
    return re.search(r"\b" + re.escape(term.lower()) + r"\b", text.lower()) is not None


def resolve_taxonomic_proximity(
    matched_subject_in_text: str, target_name: str, target_synonym_cloud: list,
    target_genus: str, target_family: str,
) -> str:
    text = matched_subject_in_text or ""
    species_candidates = [target_name] + list(target_synonym_cloud or [])
    if any(_contains_term(text, candidate) for candidate in species_candidates):
        return "Exact Match"
    if _contains_term(text, target_genus):
        return "Genus-Level Relative"
    if _contains_term(text, target_family):
        return "Family-Level Relative"
    return "Bioactivity Match (No Taxonomic Reference)"


BioactivityCategory = Literal[
    "plant", "grass", "broadleaf", "arthropod", "insect", "crustacean", "mollusk", "mussel",
    "snail", "slug", "nematode", "fungus", "bacteria", "cyanobacteria", "algae", "cancer", "other",
]

ImpactSeverity = Literal["High", "Moderate", "Limited", "Watch List"]


class MicrobeProfile(BaseModel):
    isc_id: str
    genus: str
    species: str
    strain: str


class LLMExtractionFields(BaseModel):
    matched_subject_in_text: str = Field(
        ..., description="Taxonomic name(s) or referent as they literally appear in the text"
    )
    active_molecules_identified: List[str] = Field(
        default_factory=list, description="Named bioactive compounds, toxins, or metabolites tied to the relationship"
    )
    affected_organism_reasoning: str = Field(
        ..., description=(
            "Before choosing bioactivity_category: name the organism that is being affected/inhibited/killed "
            "(the recipient of the toxin or metabolite's action), as distinct from the microbe/bacterium "
            "producing it, and state its taxonomic group. 1 short sentence."
        )
    )
    bioactivity_category: BioactivityCategory = Field(
        ..., description=(
            "Best-fit category of the AFFECTED TARGET organism identified in affected_organism_reasoning -- "
            "never the category of the producing microbe"
        )
    )
    evidence_quote: str = Field(
        ..., description="Verbatim excerpt from the abstract that proves the antagonistic/bioactive relationship"
    )
    analyst_inference: str = Field(
        ..., description=(
            "The analyst's own 1-2 sentence interpretation, in plain language, of what this evidence means "
            "and why it matters for deciding whether to pursue this microbe against this target"
        )
    )
    impact_severity: ImpactSeverity = Field(
        ..., description="Strength of the evidence: High, Moderate, Limited, or Watch List"
    )


class ProductionRecord(BaseModel):
    id: str
    paper_name: str
    doi: str
    source_url: str
    microbe_of_interest: MicrobeProfile
    target_invasive_profile: str
    matched_subject_in_text: str
    taxonomic_proximity: TaxonomicProximity
    matched_via_tier: int
    active_molecules_identified: List[str]
    bioactivity_category: BioactivityCategory
    evidence_quote: str
    analyst_inference: str
    impact_severity: ImpactSeverity
