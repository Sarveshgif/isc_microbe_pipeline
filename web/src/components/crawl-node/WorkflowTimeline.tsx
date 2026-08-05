import { cn } from "@/lib/utils"
import { PIPELINE_STAGES } from "@/data/mock"
import type { PipelineStageKey } from "@/data/types"
import type { StageStatus } from "@/hooks/useCrawlSimulation"
import { UploadCloud, Dna, Search, BrainCircuit, Database, Check, Loader2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const ICONS: Record<PipelineStageKey, LucideIcon> = {
  upload: UploadCloud,
  taxonomy: Dna,
  search: Search,
  extraction: BrainCircuit,
  production: Database,
}

export function WorkflowTimeline({ status }: { status: Record<PipelineStageKey, StageStatus> }) {
  return (
    <div className="flex items-start overflow-x-auto pb-1">
      {PIPELINE_STAGES.map((stage, idx) => {
        const Icon = ICONS[stage.key]
        const s = status[stage.key]
        const isLast = idx === PIPELINE_STAGES.length - 1
        return (
          <div key={stage.key} className="flex flex-1 items-start">
            <div className="flex min-w-[7.5rem] flex-col items-center gap-2 px-1 text-center">
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-full ring-2 transition-all",
                  s === "done" && "bg-teal-600 text-white ring-teal-600",
                  s === "active" && "bg-teal-50 text-teal-700 ring-teal-600 animate-pulse",
                  s === "pending" && "bg-muted text-muted-foreground ring-border"
                )}
              >
                {s === "done" ? (
                  <Check className="size-5" />
                ) : s === "active" ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Icon className="size-5" />
                )}
              </div>
              <div>
                <p
                  className={cn(
                    "text-xs font-medium",
                    s === "pending" ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {stage.label}
                </p>
                <p className="hidden text-[11px] text-muted-foreground sm:block">{stage.description}</p>
              </div>
            </div>
            {!isLast && (
              <div className="mt-5 flex h-px flex-1 items-center">
                <div
                  className={cn(
                    "h-px w-full",
                    s === "done" ? "flow-line-h" : "border-t border-dashed border-border"
                  )}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
