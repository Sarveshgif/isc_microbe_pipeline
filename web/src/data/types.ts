// Shapes mirror the real pipeline's models/extraction_shapes.py and
// sheets_infra/sheets_handler.py headers, so the UI mock data stays
// consistent with the production schema.

export type TaxonomicProximity =
  | "Exact Match"
  | "Genus-Level Relative"
  | "Family-Level Relative"
  | "Bioactivity Match (No Taxonomic Reference)"

export type BioactivityCategory =
  | "plant"
  | "grass"
  | "broadleaf"
  | "arthropod"
  | "insect"
  | "crustacean"
  | "mollusk"
  | "mussel"
  | "snail"
  | "slug"
  | "nematode"
  | "fungus"
  | "bacteria"
  | "cyanobacteria"
  | "algae"
  | "cancer"
  | "other"

export type ImpactSeverity = "High" | "Moderate" | "Limited" | "Watch List"

export type ResolutionStatus = "PENDING" | "FOUND" | "NO_RELATION_FOUND"

export interface MicrobeProfile {
  iscId: string
  genus: string
  species: string
  strain: string
}

export interface CsvRow {
  iscId: string
  genus: string
  species: string
  strain: string
  targetName: string
}

export interface EvidenceRecord {
  id: string
  microbeOfInterest: MicrobeProfile
  microbeResolvedName: string
  targetInvasiveProfile: string
  targetCommonName: string
  paperName: string
  doi: string
  sourceUrl: string
  abstract: string
  matchedSubjectInText: string
  taxonomicProximity: TaxonomicProximity
  matchedViaTier: number
  activeMoleculesIdentified: string[]
  bioactivityCategory: BioactivityCategory
  evidenceQuote: string
  analystInference: string
  impactSeverity: ImpactSeverity
  resolutionStatus: ResolutionStatus
  publishedYear: number
}

export interface LogLine {
  id: number
  text: string
  level: "info" | "success" | "warning" | "error"
}

export type PipelineStageKey =
  | "upload"
  | "taxonomy"
  | "search"
  | "extraction"
  | "production"

export interface PipelineStage {
  key: PipelineStageKey
  label: string
  description: string
}

export interface PipelineSummary {
  canonicalPairs: number
  openAlexPapers: number
  llmAnalyses: number
  evidenceExtracted: number
  noRelationFound: number
  processingTimeSeconds: number
}

export type ConnectionStatus = "connected" | "warning" | "disconnected"

export interface ServiceConnection {
  id: string
  name: string
  description: string
  endpoint: string
  status: ConnectionStatus
  enabled: boolean
  lastChecked: string
}
