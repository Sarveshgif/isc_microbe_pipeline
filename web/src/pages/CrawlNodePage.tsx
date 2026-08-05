import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { WorkflowTimeline } from "@/components/crawl-node/WorkflowTimeline"
import { UploadCsv } from "@/components/crawl-node/UploadCsv"
import { PipelineConfig } from "@/components/crawl-node/PipelineConfig"
import { RunControls } from "@/components/crawl-node/RunControls"
import { LiveActivityLog } from "@/components/crawl-node/LiveActivityLog"
import { EvidenceTable } from "@/components/shared/EvidenceTable"
import { EvidenceDetailSheet } from "@/components/shared/EvidenceDetailSheet"
import { StatCard } from "@/components/shared/StatCard"
import { Skeleton } from "@/components/ui/skeleton"
import { useCrawlSimulation } from "@/hooks/useCrawlSimulation"
import type { EvidenceRecord } from "@/data/types"
import { GitMerge, BookOpen, BrainCircuit, FileCheck2, EyeOff, Timer, FileStack } from "lucide-react"

export function CrawlNodePage() {
  const [uploaded, setUploaded] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const sim = useCrawlSimulation(uploaded)
  const [selected, setSelected] = useState<EvidenceRecord | null>(null)

  function handleUpload(name: string) {
    setUploaded(true)
    setFileName(name)
  }
  function handleClear() {
    setUploaded(false)
    setFileName(null)
    sim.reset()
  }

  const summaryCards = [
    { label: "Canonical Pairs", icon: GitMerge, tone: "teal" as const, value: sim.summary?.canonicalPairs },
    { label: "OpenAlex Papers", icon: BookOpen, tone: "teal" as const, value: sim.summary?.openAlexPapers },
    { label: "LLM Analyses", icon: BrainCircuit, tone: "teal" as const, value: sim.summary?.llmAnalyses },
    { label: "Evidence Extracted", icon: FileCheck2, tone: "yellow" as const, value: sim.summary?.evidenceExtracted },
    { label: "No Relation Found", icon: EyeOff, tone: "neutral" as const, value: sim.summary?.noRelationFound },
    {
      label: "Processing Time",
      icon: Timer,
      tone: "neutral" as const,
      value: sim.summary ? `${Math.floor(sim.summary.processingTimeSeconds / 60)}m ${sim.summary.processingTimeSeconds % 60}s` : undefined,
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Literature Evidence Pipeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload microbe / target pairs and run the full discovery-to-evidence workflow.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardContent>
          <WorkflowTimeline status={sim.stageStatus} />
        </CardContent>
      </Card>

      <UploadCsv uploaded={uploaded} fileName={fileName} onUpload={handleUpload} onClear={handleClear} />

      <PipelineConfig />

      <RunControls
        canStart={uploaded}
        running={sim.running}
        finished={sim.finished}
        stageStatus={sim.stageStatus}
        stageProgress={sim.stageProgress}
        onStart={sim.start}
        onReset={sim.reset}
      />

      <LiveActivityLog logs={sim.logs} running={sim.running} />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>5. Pipeline Summary</CardTitle>
          <CardDescription>
            {sim.finished ? "Results from the most recent run." : "Statistics populate once a run completes."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {summaryCards.map((c) => (
              <StatCard
                key={c.label}
                label={c.label}
                icon={c.icon}
                tone={c.tone}
                value={c.value ?? "—"}
                loading={sim.running && c.value === undefined}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <FileStack className="size-4" />
            6. Evidence Preview
          </CardTitle>
          <CardDescription>Click a row to review the full extracted evidence.</CardDescription>
        </CardHeader>
        <CardContent>
          {sim.evidenceRows.length > 0 ? (
            <EvidenceTable records={sim.evidenceRows} onRowClick={setSelected} />
          ) : sim.running ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-14 text-center">
              <FileStack className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Run the pipeline to preview extracted evidence here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <EvidenceDetailSheet record={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  )
}
