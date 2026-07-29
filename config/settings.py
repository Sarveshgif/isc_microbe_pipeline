import os

from dotenv import load_dotenv

load_dotenv()

# --- Scrapy core ---
BOT_NAME = "isc_microbe_pipeline"
SPIDER_MODULES = ["spiders"]
NEWSPIDER_MODULE = "spiders"
ROBOTSTXT_OBEY = True

# --- Throttling: never burst OpenAlex/GBIF/NCBI unthrottled ---
DOWNLOAD_DELAY = 0.5
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 0.5
AUTOTHROTTLE_MAX_DELAY = 10
AUTOTHROTTLE_TARGET_CONCURRENCY = 2.0
CONCURRENT_REQUESTS = 8
CONCURRENT_REQUESTS_PER_DOMAIN = 4
RETRY_ENABLED = True
RETRY_TIMES = 3

# --- Identity for polite API pools ---
OPENALEX_MAILTO = os.environ.get("OPENALEX_MAILTO", "")
USER_AGENT = (
    f"isc_microbe_pipeline (mailto:{OPENALEX_MAILTO})" if OPENALEX_MAILTO else "isc_microbe_pipeline"
)

# --- GBIF: target invasive species side ---
GBIF_MATCH_URL = "https://api.gbif.org/v1/species/match"
GBIF_SYNONYMS_URL = "https://api.gbif.org/v1/species/{usage_key}/synonyms"
GBIF_LOW_CONFIDENCE_THRESHOLD = 80
GBIF_REQUEST_DELAY_SECONDS = 0.2

# --- NCBI Taxonomy: microbe-of-interest side (GBIF has weak microbial coverage) ---
NCBI_ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
NCBI_EFETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
NCBI_REQUEST_DELAY_SECONDS = 0.34  # NCBI caps unauthenticated eutils at ~3 req/sec
NCBI_TOOL = "isc_microbe_pipeline"
NCBI_EMAIL = os.environ.get("NCBI_EMAIL", "")

# --- OpenAlex (Phase 2) ---
OPENALEX_WORKS_URL = "https://api.openalex.org/works"
OPENALEX_MAX_WORKS = 50

# Directional interaction keywords, ANDed into every Tier 1-3 query (org keyword sheet)
MICROBE_AS_SUBJECT_KEYWORDS = [
    "inhibits", "antagonizes", "antagonistic",
    "antagonize", "antagonise", "antagonises", "antagonizing", "antagonising", "antagonism",
    "suppresses", "suppression", "suppressive",
    "antibiosis", "mycoparasite", "mycoparasitism", "entomopathogenic",
    "pathogenic to", "toxic to", "lethal to", "virulent against",
    "inhibitory", "inhibition",
    "antifungal", "antibacterial", "antimicrobial",
    "herbicide", "herbicidal", "algaecide", "algaecidal", "fungicide", "fungicidal",
    "bactericide", "bactericidal", "insecticide", "insecticidal", "nematicide", "nematicidal",
    "molluscicide", "molluscicidal", "acaricide", "acaricidal",
    "biocontrol", "biological control",
]
TARGET_AS_SUBJECT_KEYWORDS = [
    "inhibited by", "antagonized", "antagonized by", "antagonised", "antagonised by",
    "suppressed by", "controlled by", "killed by", "susceptible to", "infected by", "parasitized by",
]
GENERIC_INTERACTION_KEYWORDS = ["bioactive", "bioactivity"]
INTERACTION_KEYWORD_CLAUSE = "(" + " OR ".join(
    f'"{kw}"' for kw in MICROBE_AS_SUBJECT_KEYWORDS + TARGET_AS_SUBJECT_KEYWORDS + GENERIC_INTERACTION_KEYWORDS
) + ")"

# Narrower keyword set, Tier 4 only
OPENALEX_BIOACTIVITY_CLAUSE = '("bioactive" OR "toxin" OR "metabolite" OR "exudate")'

# --- Input / checkpoint (Phase 1) ---
INPUT_CSV_PATH = os.environ.get("MICROBE_INPUT_CSV", "data/microbe_target_pairs.csv")
TAXONOMY_CHECKPOINT_PATH = os.environ.get("TAXONOMY_CHECKPOINT_PATH", "data/taxonomy_checkpoint.json")

# --- Google Sheets (sheets_infra) ---
GOOGLE_SERVICE_ACCOUNT_FILE = os.environ.get(
    "GOOGLE_SERVICE_ACCOUNT_FILE", "credentials/service_account.json"
)
GOOGLE_SHEET_ID = os.environ.get("GOOGLE_SHEET_ID", "")
STAGING_WORKSHEET = "Staging"
PRODUCTION_WORKSHEET = "Production"
DOI_CACHE_WORKSHEET = "DoiCache"
PAIR_DOI_SENT_WORKSHEET = "PairDoiSent"

# --- LLM (Phase 4) -- local Ollama, no API cost ---
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434/v1")
LLM_PROVIDER_MODEL = os.environ.get("LLM_MODEL", "qwen2.5:3b")
LLM_MAX_RETRIES = 2
