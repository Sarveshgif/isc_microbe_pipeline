import type {
  CsvRow,
  EvidenceRecord,
  PipelineStage,
  PipelineSummary,
  ServiceConnection,
} from "./types"

export const MICROBES = [
  { iscId: "ISC-B012", genus: "Bacillus", species: "subtilis", strain: "QST 713" },
  { iscId: "ISC-P004", genus: "Pseudomonas", species: "fluorescens", strain: "CHA0" },
  { iscId: "ISC-M019", genus: "Metarhizium", species: "anisopliae", strain: "F52" },
  { iscId: "ISC-B027", genus: "Beauveria", species: "bassiana", strain: "GHA" },
  { iscId: "ISC-T003", genus: "Trichoderma", species: "harzianum", strain: "T-22" },
  { iscId: "ISC-S011", genus: "Streptomyces", species: "griseus", strain: "NRRL B-2682" },
  { iscId: "ISC-P020", genus: "Pseudomonas", species: "protegens", strain: "Pf-5" },
  { iscId: "ISC-B031", genus: "Bacillus", species: "safensis", strain: "FO-36b" },
]

export const TARGETS = [
  { name: "Lycorma delicatula", common: "Spotted Lanternfly" },
  { name: "Lepeophtheirus salmonis", common: "Sea Lice" },
  { name: "Dreissena polymorpha", common: "Zebra Mussel" },
  { name: "Reynoutria japonica", common: "Japanese Knotweed" },
  { name: "Agrilus planipennis", common: "Emerald Ash Borer" },
  { name: "Hypophthalmichthys molitrix", common: "Silver Carp" },
  { name: "Heracleum mantegazzianum", common: "Giant Hogweed" },
  { name: "Pomacea canaliculata", common: "Golden Apple Snail" },
]

export const CSV_HEADERS = ["isc_id", "genus", "species", "strain", "target_name"] as const

export const CSV_PREVIEW_ROWS: CsvRow[] = [
  { iscId: "ISC-B012", genus: "Bacillus", species: "subtilis", strain: "QST 713", targetName: "Lycorma delicatula" },
  { iscId: "ISC-P004", genus: "Pseudomonas", species: "fluorescens", strain: "CHA0", targetName: "Dreissena polymorpha" },
  { iscId: "ISC-M019", genus: "Metarhizium", species: "anisopliae", strain: "F52", targetName: "Lycorma delicatula" },
  { iscId: "ISC-B027", genus: "Beauveria", species: "bassiana", strain: "GHA", targetName: "Agrilus planipennis" },
  { iscId: "ISC-T003", genus: "Trichoderma", species: "harzianum", strain: "T-22", targetName: "Reynoutria japonica" },
  { iscId: "ISC-S011", genus: "Streptomyces", species: "griseus", strain: "", targetName: "Heracleum mantegazzianum" },
  { iscId: "ISC-P020", genus: "Pseudomonas", species: "protegens", strain: "Pf-5", targetName: "Pomacea canaliculata" },
  { iscId: "ISC-B031", genus: "Bacillus", species: "safensis", strain: "FO-36b", targetName: "Lepeophtheirus salmonis" },
  { iscId: "ISC-M022", genus: "Metarhizium", species: "brunneum", strain: "Ma43", targetName: "Hypophthalmichthys molitrix" },
  { iscId: "ISC-B040", genus: "Bacillus", species: "thuringiensis", strain: "kurstaki", targetName: "Lycorma delicatula" },
]

export const PIPELINE_STAGES: PipelineStage[] = [
  { key: "upload", label: "Upload CSV", description: "Ingest microbe / target pairs" },
  { key: "taxonomy", label: "Taxonomy Resolution", description: "NCBI + GBIF canonicalization" },
  { key: "search", label: "Literature Search", description: "Tiered OpenAlex query" },
  { key: "extraction", label: "LLM Extraction", description: "Structured evidence extraction" },
  { key: "production", label: "Production Database", description: "Write to evidence sheet" },
]

export const PIPELINE_SUMMARY: PipelineSummary = {
  canonicalPairs: 42,
  openAlexPapers: 386,
  llmAnalyses: 214,
  evidenceExtracted: 57,
  noRelationFound: 19,
  processingTimeSeconds: 268,
}

const ABSTRACT_SNIPPETS: Record<string, string> = {
  lanternfly:
    "Field and laboratory bioassays evaluated the pathogenicity of entomopathogenic isolates against nymphal and adult Lycorma delicatula. Spray applications produced significant mortality within 5-7 days post-exposure, with conidial concentration positively correlated with infection rate. Cadaver sporulation confirmed successful host colonization and secondary transmission potential within caged populations.",
  seaLice:
    "Sea lice (Lepeophtheirus salmonis) represent a persistent challenge for Atlantic salmon aquaculture. This study screened culturable marine bacterial isolates for delousing bioactivity, identifying several strains producing extracellular metabolites with acute toxicity toward copepodid and chalimus life stages under controlled tank trials.",
  zebraMussel:
    "Dreissena polymorpha veliger settlement was assessed following exposure to a bacterial biopesticide formulation. Treated substrates showed reduced byssal attachment and elevated juvenile mortality relative to untreated controls, suggesting a viable non-chemical control avenue for intake pipe biofouling.",
  knotweed:
    "Reynoutria japonica rhizome fragments were inoculated with soil-derived fungal antagonists to assess suppression of regenerative sprouting. Treated fragments exhibited reduced shoot emergence and stunted rhizome extension, consistent with disruption of carbohydrate reserves by fungal colonization.",
  ashBorer:
    "Agrilus planipennis larvae reared on artificial diet amended with entomopathogenic fungal conidia showed dose-dependent mortality. Histopathology confirmed hyphal penetration of the larval cuticle and subsequent hemocoel colonization, consistent with a classical entomopathogenic infection cycle.",
  carp:
    "Juvenile Hypophthalmichthys molitrix were exposed to bacterially-derived metabolite extracts in static renewal bioassays. Behavioral abnormalities and elevated gill epithelium damage were observed at higher concentrations, with LC50 values suggesting feasibility for targeted biocontrol formulations.",
  hogweed:
    "Heracleum mantegazzianum seedlings inoculated with rhizosphere-competent bacterial antagonists displayed reduced germination success and root biomass. Furanocoumarin content in treated tissue was unaffected, indicating a mechanism independent of phototoxic compound suppression.",
  snail:
    "Pomacea canaliculata egg masses and juveniles were exposed to molluscicidal metabolite extracts derived from soil actinomycete fermentation broth. Egg viability declined sharply at higher extract concentrations, with juvenile shell abnormalities noted in surviving individuals.",
}

const PAPER_TITLES: Record<string, string[]> = {
  lanternfly: [
    "Entomopathogenic fungal isolates as biocontrol candidates for Lycorma delicatula nymphs",
    "Field efficacy of Beauveria bassiana conidial suspensions against spotted lanternfly populations",
    "Cuticle-penetrating virulence factors of Metarhizium spp. toward invasive planthoppers",
  ],
  seaLice: [
    "Marine bacterial metabolites with delousing activity against Lepeophtheirus salmonis",
    "Screening Pseudomonas isolates for sea lice control in Atlantic salmon aquaculture",
    "Extracellular antiparasitic compounds active against salmonid ectoparasites",
  ],
  zebraMussel: [
    "Bacillus-derived biopesticide formulations for zebra mussel veliger control",
    "Suppression of Dreissena polymorpha settlement using Pseudomonas fluorescens metabolites",
    "Non-chemical biofouling control strategies for invasive dreissenid mussels",
  ],
  knotweed: [
    "Fungal antagonists of Reynoutria japonica rhizome regeneration",
    "Trichoderma harzianum suppresses sprouting in Japanese knotweed rhizome fragments",
    "Soil-borne biocontrol agents for invasive Fallopia japonica management",
  ],
  ashBorer: [
    "Entomopathogenic fungi for biological control of Agrilus planipennis larvae",
    "Metarhizium anisopliae virulence toward emerald ash borer under laboratory conditions",
    "Larval susceptibility of Agrilus planipennis to fungal biopesticides",
  ],
  carp: [
    "Bacterial metabolite toxicity toward juvenile silver carp",
    "Biocontrol potential of Streptomyces-derived compounds against invasive carp species",
    "Behavioral and histological effects of bacterial extracts on Hypophthalmichthys molitrix",
  ],
  hogweed: [
    "Rhizosphere bacterial antagonists inhibit Heracleum mantegazzianum germination",
    "Biological suppression of giant hogweed seedling establishment",
    "Bacillus subtilis root colonization reduces invasive umbellifer seedling vigor",
  ],
  snail: [
    "Molluscicidal actinomycete metabolites against Pomacea canaliculata",
    "Streptomyces griseus fermentation extracts reduce golden apple snail egg viability",
    "Biocontrol screening of soil actinomycetes for invasive apple snail management",
  ],
}

const MOLECULE_POOL = [
  "surfactin",
  "iturin A",
  "fengycin",
  "destruxin A",
  "beauvericin",
  "oosporein",
  "phenazine-1-carboxylic acid",
  "2,4-diacetylphloroglucinol",
  "cyclic lipopeptides",
  "chitinase",
  "protease PR1",
  "actinomycin D",
]

type TargetKey = keyof typeof ABSTRACT_SNIPPETS

const TARGET_KEY_BY_NAME: Record<string, TargetKey> = {
  "Lycorma delicatula": "lanternfly",
  "Lepeophtheirus salmonis": "seaLice",
  "Dreissena polymorpha": "zebraMussel",
  "Reynoutria japonica": "knotweed",
  "Agrilus planipennis": "ashBorer",
  "Hypophthalmichthys molitrix": "carp",
  "Heracleum mantegazzianum": "hogweed",
  "Pomacea canaliculata": "snail",
}

const BIOACTIVITY_BY_TARGET: Record<TargetKey, EvidenceRecord["bioactivityCategory"]> = {
  lanternfly: "insect",
  seaLice: "crustacean",
  zebraMussel: "mussel",
  knotweed: "plant",
  ashBorer: "insect",
  carp: "other",
  hogweed: "broadleaf",
  snail: "snail",
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260804)
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}
function pickN<T>(arr: T[], n: number): T[] {
  const pool = [...arr]
  const out: T[] = []
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(rand() * pool.length)
    out.push(pool.splice(idx, 1)[0])
  }
  return out
}

const PROXIMITIES: EvidenceRecord["taxonomicProximity"][] = [
  "Exact Match",
  "Genus-Level Relative",
  "Family-Level Relative",
  "Bioactivity Match (No Taxonomic Reference)",
]
const SEVERITIES: EvidenceRecord["impactSeverity"][] = ["High", "Moderate", "Limited", "Watch List"]

function buildEvidence(): EvidenceRecord[] {
  const records: EvidenceRecord[] = []
  let counter = 1
  for (const microbe of MICROBES) {
    const targetSample = pickN(TARGETS, 2 + Math.floor(rand() * 2))
    for (const target of targetSample) {
      const key = TARGET_KEY_BY_NAME[target.name]
      const titles = PAPER_TITLES[key]
      const title = pick(titles)
      const proximity = pick(PROXIMITIES)
      const severity = pick(SEVERITIES)
      const tier = proximity === "Exact Match" ? 1 : proximity === "Genus-Level Relative" ? 2 : proximity === "Family-Level Relative" ? 3 : 4
      const year = 2016 + Math.floor(rand() * 9)
      const doi = `10.1094/isc.${2000 + counter}.${String(counter).padStart(4, "0")}`
      const status: EvidenceRecord["resolutionStatus"] = rand() > 0.12 ? "FOUND" : "NO_RELATION_FOUND"
      records.push({
        id: `EV-${String(counter).padStart(4, "0")}`,
        microbeOfInterest: microbe,
        microbeResolvedName: `${microbe.genus} ${microbe.species}`,
        targetInvasiveProfile: target.name,
        targetCommonName: target.common,
        paperName: title,
        doi,
        sourceUrl: `https://doi.org/${doi}`,
        abstract: ABSTRACT_SNIPPETS[key],
        matchedSubjectInText:
          proximity === "Exact Match"
            ? target.name
            : proximity === "Genus-Level Relative"
              ? target.name.split(" ")[0] + " sp."
              : proximity === "Family-Level Relative"
                ? "related congener species"
                : "no direct taxonomic reference",
        taxonomicProximity: proximity,
        matchedViaTier: tier,
        activeMoleculesIdentified: pickN(MOLECULE_POOL, 1 + Math.floor(rand() * 3)),
        bioactivityCategory: BIOACTIVITY_BY_TARGET[key],
        evidenceQuote: ABSTRACT_SNIPPETS[key].split(". ").slice(1, 2).join(". ") + ".",
        analystInference:
          status === "FOUND"
            ? `This isolate shows ${severity.toLowerCase() === "watch list" ? "preliminary" : severity.toLowerCase()} evidence of activity against ${target.common}, supporting further greenhouse-stage validation before field trial prioritization.`
            : `No direct antagonistic relationship to ${target.common} was supported by this abstract; retained for reference only.`,
        impactSeverity: severity,
        resolutionStatus: status,
        publishedYear: year,
      })
      counter++
    }
  }
  return records
}

export const EVIDENCE_RECORDS: EvidenceRecord[] = buildEvidence()

export const SERVICE_CONNECTIONS: ServiceConnection[] = [
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Staging, Production, DoiCache and PairDoiSent worksheets",
    endpoint: "sheets.googleapis.com/v4",
    status: "connected",
    enabled: true,
    lastChecked: "2 min ago",
  },
  {
    id: "openalex",
    name: "OpenAlex",
    description: "Tiered literature search over the Works API",
    endpoint: "api.openalex.org/works",
    status: "connected",
    enabled: true,
    lastChecked: "2 min ago",
  },
  {
    id: "ncbi",
    name: "NCBI Taxonomy",
    description: "Microbe-of-interest taxonomic resolution",
    endpoint: "eutils.ncbi.nlm.nih.gov/entrez/eutils",
    status: "connected",
    enabled: true,
    lastChecked: "5 min ago",
  },
  {
    id: "gbif",
    name: "GBIF",
    description: "Target invasive species taxonomic resolution",
    endpoint: "api.gbif.org/v1/species",
    status: "warning",
    enabled: true,
    lastChecked: "5 min ago",
  },
  {
    id: "ollama",
    name: "Ollama",
    description: "Local LLM extraction runtime",
    endpoint: "localhost:11434/v1 · qwen2.5:3b",
    status: "disconnected",
    enabled: false,
    lastChecked: "31 min ago",
  },
]
