import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  FileSpreadsheet,
  Dna,
  Leaf,
  GitMerge,
  Search,
  BrainCircuit,
  Table2,
  Database,
  ChevronDown,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface FlowNodeData {
  key: string
  icon: LucideIcon
  title: string
  subtitle: string
  tone: "teal" | "yellow" | "neutral"
  status: "Operational" | "Degraded"
}

const NODES: FlowNodeData[] = [
  { key: "csv", icon: FileSpreadsheet, title: "CSV", subtitle: "Raw microbe / target pair upload", tone: "neutral", status: "Operational" },
  { key: "taxonomy", icon: Dna, title: "Taxonomy Resolution", subtitle: "Canonicalize names before search", tone: "teal", status: "Operational" },
  { key: "ncbi", icon: Dna, title: "NCBI Taxonomy", subtitle: "Microbe-of-interest lookup", tone: "teal", status: "Operational" },
  { key: "gbif", icon: Leaf, title: "GBIF", subtitle: "Target invasive species lookup", tone: "yellow", status: "Degraded" },
  { key: "pair-builder", icon: GitMerge, title: "Canonical Pair Builder", subtitle: "Dedupe + synonym cloud assembly", tone: "teal", status: "Operational" },
  { key: "openalex", icon: Search, title: "OpenAlex", subtitle: "Tiered literature search", tone: "teal", status: "Operational" },
  { key: "llm", icon: BrainCircuit, title: "LLM Extraction", subtitle: "Ollama structured extraction", tone: "teal", status: "Operational" },
  { key: "sheets", icon: Table2, title: "Google Sheets", subtitle: "Staging + persistence layer", tone: "teal", status: "Operational" },
  { key: "production", icon: Database, title: "Production Evidence", subtitle: "Final analyst-ready dataset", tone: "teal", status: "Operational" },
]

const TONE_STYLES: Record<FlowNodeData["tone"], string> = {
  teal: "bg-teal-50 text-teal-700",
  yellow: "bg-warning/25 text-warning-foreground",
  neutral: "bg-muted text-muted-foreground",
}

const STATUS_DOT: Record<FlowNodeData["status"], string> = {
  Operational: "bg-teal-600",
  Degraded: "bg-warning",
}

function Connector() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="flow-line-v h-7 w-px" />
      <ChevronDown className="-mt-1 size-4 text-teal-600/70" />
    </div>
  )
}

export function PipelineStatusPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pipeline Status</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          End-to-end architecture: how a raw CSV becomes production-ready evidence.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col items-stretch">
        {NODES.map((node, idx) => {
          const isLast = idx === NODES.length - 1
          const Icon = node.icon
          return (
            <div key={node.key}>
              <Card
                className={cn(
                  "flex-row items-center gap-3 px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                  isLast && "ring-teal-600/30"
                )}
              >
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", TONE_STYLES[node.tone])}>
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{node.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{node.subtitle}</p>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className={cn("size-1.5 rounded-full", STATUS_DOT[node.status], node.status === "Operational" && "animate-pulse")} />
                  {node.status}
                </span>
              </Card>
              {!isLast && <Connector />}
            </div>
          )
        })}
      </div>

      <Card className="mx-auto w-full max-w-md gap-2 bg-teal-50/60 px-4 py-3 text-center text-xs text-teal-700 shadow-none ring-teal-600/10">
        All 9 components reporting normally, except a degraded GBIF match-confidence warning (see Settings).
      </Card>
    </div>
  )
}
