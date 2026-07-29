import logging

import instructor
from openai import AsyncOpenAI

from config import settings
from models.extraction_shapes import LLMExtractionFields

logger = logging.getLogger(__name__)

_client = instructor.from_openai(
    AsyncOpenAI(base_url=settings.OLLAMA_BASE_URL, api_key="ollama"),
    mode=instructor.Mode.JSON,
)

_SYSTEM_PROMPT = (
    "You are a biosecurity analyst identifying evidence of a relationship between a microbe of "
    "interest and a target invasive species in academic abstracts. Only report what the text supports."
)


async def extract_fields(abstract_text: str, title: str, microbe_name: str, target_name: str):
    try:
        return await _client.chat.completions.create(
            model=settings.LLM_PROVIDER_MODEL,
            max_retries=settings.LLM_MAX_RETRIES,
            response_model=LLMExtractionFields,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": (
                    f"Paper title: {title}\n"
                    f"Microbe of interest: {microbe_name}\n"
                    f"Target invasive species: {target_name}\n\n"
                    f"Abstract:\n{abstract_text}\n\n"
                    "Instructions:\n"
                    "1. matched_subject_in_text: Name the subject(s) of this relationship exactly as they "
                    "appear in the abstract. If multiple organisms are named, join them into ONE string "
                    "separated by \"; \" -- never return a list.\n"
                    "2. active_molecules_identified: List specific bioactive molecules, toxins, or "
                    "metabolites mentioned. Leave empty if none are named.\n"
                    "3. affected_organism_reasoning: Before picking a category, identify in one short "
                    "sentence WHICH organism is being affected/inhibited/killed in this relationship (the "
                    "recipient of the toxin or metabolite's action), and its taxonomic group -- explicitly "
                    "as distinct from the microbe/bacterium that is producing the toxin or metabolite.\n"
                    "4. bioactivity_category: Choose exactly ONE word, copied verbatim, from this exact "
                    "list: plant, grass, broadleaf, arthropod, insect, crustacean, mollusk, mussel, snail, "
                    "slug, nematode, fungus, bacteria, cyanobacteria, algae, cancer, other. Match the word "
                    "form exactly -- use \"fungus\" not \"fungi\", \"insect\" not \"insects\".\n\n"
                    "### Bioactivity Category Rules:\n"
                    "- bioactivity_category MUST represent the taxonomic group of the TARGET ORGANISM BEING "
                    "AFFECTED/INHIBITED (the recipient of the action), i.e. the organism named in "
                    "affected_organism_reasoning.\n"
                    "- DO NOT select the category of the microbe/bacterium producing the toxin/metabolite.\n"
                    "  - Example: A bacterial toxin killing a weed -> `broadleaf` or `grass` (NOT `bacteria`).\n"
                    "  - Example: A bacterial toxin inhibiting microalgae -> `algae` (NOT `bacteria`).\n\n"
                    "### Taxonomic Mapping Guidance:\n"
                    "- Microalgae, macroalgae, phytoplankton, Chlamydomonas -> `algae`\n"
                    "- Cyanobacteria, blue-green algae -> `cyanobacteria`\n"
                    "- Microbes, pathogens, phytoplasmas -> `bacteria` or `fungus`\n\n"
                    "5. evidence_quote: Copy the exact sentence(s) verbatim from the abstract (no "
                    "paraphrasing) that most directly support the relationship.\n"
                    "6. analyst_inference: In your own words, in 1-2 plain-language sentences, state what "
                    "this evidence means and why it matters for someone deciding whether to pursue this "
                    "microbe against this target. This is your interpretation, not a quote -- do not repeat "
                    "evidence_quote verbatim.\n"
                    "7. impact_severity: Rate High, Moderate, Limited, or Watch List based on how strong "
                    "and direct the evidence is.\n\n"
                    "If the target invasive species is not clearly discussed, or no direct relationship is "
                    "supported by the text, set bioactivity_category to \"other\" and impact_severity to "
                    "\"Watch List\" -- never leave a field blank or null."
                )},
            ],
        )
    except Exception as exc:
        logger.warning(f"LLM extraction failed for title={title!r}: {exc}")
        return None
