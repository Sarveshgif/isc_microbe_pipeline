import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PIPELINE_STAGES } from "@/data/mock"
import type { PipelineStageKey } from "@/data/types"
import type { StageStatus } from "@/hooks/useCrawlSimulation"
import { cn } from "@/lib/utils"
import { Play, Loader2, Check, RotateCcw } from "lucide-react"

const RUN_STAGE_KEYS: PipelineStageKey[] = ["taxonomy", "search", "extraction", "production"]
const RUN_STAGE_VERBS: Record<PipelineStageKey, string> = {
  upload: "Upload",
  taxonomy: "Resolving taxonomy",
  search: "Searching literature",
  extraction: "Running LLM extraction",
  production: "Writing production sheet",
}

export function RunControls({
  canStart,
  running,
  finished,
  stageStatus,
  stageProgress,
  onStart,
  onReset,
}: {
  canStart: boolean
  running: boolean
  finished: boolean
  stageStatus: Record<PipelineStageKey, StageStatus>
  stageProgress: Record<PipelineStageKey, number>
  onStart: () => void
  onReset: () => void
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>3. Run Pipeline</CardTitle>
        <CardDescription>
          {canStart ? "Launch the configured pipeline against the uploaded pairs." : "Upload a CSV to enable this step."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex gap-3">
          <Button size="lg" className="flex-1" disabled={!canStart || running} onClick={onStart}>
            {running ? (
              <>
                <Loader2 className="animate-spin" /> Running Crawl...
              </>
            ) : finished ? (
              <>
                <RotateCcw /> Run Again
              </>
            ) : (
              <>
                <Play /> Start Crawl
              </>
            )}
          </Button>
          {(running || finished) && (
            <Button size="lg" variant="outline" onClick={onReset} disabled={running}>
              Reset
            </Button>
          )}
        </div>

        {(running || finished) && (
          <div className="flex flex-col gap-4">
            {RUN_STAGE_KEYS.map((key) => {
              const status = stageStatus[key]
              const progress = stageProgress[key]
              const stageMeta = PIPELINE_STAGES.find((s) => s.key === key)!
              return (
                <div key={key}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span
                      className={cn(
                        "flex items-center gap-1.5 font-medium",
                        status === "pending" ? "text-muted-foreground" : "text-foreground"
                      )}
                    >
                      {status === "done" ? (
                        <Check className="size-3.5 text-teal-600" />
                      ) : status === "active" ? (
                        <Loader2 className="size-3.5 animate-spin text-teal-600" />
                      ) : (
                        <span className="size-3.5 rounded-full border border-border" />
                      )}
                      {RUN_STAGE_VERBS[key]}
                      {status === "active" && "..."}
                    </span>
                    <span className="text-muted-foreground">{stageMeta.label}</span>
                  </div>
                  <Progress
                    value={progress}
                    className={cn(status === "pending" && "opacity-40")}
                  />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
