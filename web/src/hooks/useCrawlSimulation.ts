import { useCallback, useEffect, useRef, useState } from "react"
import { EVIDENCE_RECORDS, MICROBES, PIPELINE_SUMMARY, TARGETS } from "@/data/mock"
import type { EvidenceRecord, LogLine, PipelineStageKey, PipelineSummary } from "@/data/types"

export type StageStatus = "pending" | "active" | "done"

const RUN_STAGES: PipelineStageKey[] = ["taxonomy", "search", "extraction", "production"]

const STEP_MS = 200
const STAGE_PAUSE_MS = 300

let logIdCounter = 0

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildScript(): Record<PipelineStageKey, { text: string; level: LogLine["level"] }[]> {
  const microbeSample = [...MICROBES].sort(() => Math.random() - 0.5).slice(0, 3)
  const targetSample = [...TARGETS].sort(() => Math.random() - 0.5).slice(0, 3)

  const taxonomy: { text: string; level: LogLine["level"] }[] = []
  microbeSample.forEach((m) => {
    taxonomy.push({ text: `Resolving ${m.genus} ${m.species}...`, level: "info" })
    taxonomy.push({ text: `NCBI Taxonomy matched -- taxid ${1300 + Math.floor(Math.random() * 8000)}`, level: "success" })
  })
  targetSample.forEach((t) => {
    const confidence = 88 + Math.floor(Math.random() * 12)
    taxonomy.push({ text: `Resolving ${t.common} (${t.name})...`, level: "info" })
    taxonomy.push({
      text: `GBIF confidence ${confidence}%${confidence < 92 ? " -- fuzzy match" : ""}`,
      level: confidence < 92 ? "warning" : "success",
    })
  })
  taxonomy.push({ text: "Deduplicating canonical pairs...", level: "info" })
  taxonomy.push({ text: `${microbeSample.length * targetSample.length} canonical pairs built`, level: "success" })

  const search: { text: string; level: LogLine["level"] }[] = []
  microbeSample.forEach((m) => {
    const target = pickRandom(targetSample)
    search.push({ text: `Searching OpenAlex: "${m.genus} ${m.species}" x "${target.common}"...`, level: "info" })
    const tier1 = Math.random() > 0.4
    if (!tier1) {
      search.push({ text: "Tier 1 query: 0 results -- escalating to Tier 2", level: "warning" })
    }
    const found = 3 + Math.floor(Math.random() * 20)
    search.push({ text: `${found} papers found`, level: "success" })
  })

  const extraction: { text: string; level: LogLine["level"] }[] = []
  const severities = ["HIGH", "MODERATE", "LIMITED"]
  for (let i = 0; i < 5; i++) {
    extraction.push({ text: `Running LLM extraction on abstract ${i + 1}...`, level: "info" })
    if (Math.random() > 0.3) {
      const sev = pickRandom(severities)
      extraction.push({ text: `Severity ${sev} detected`, level: sev === "HIGH" ? "success" : "info" })
    } else {
      extraction.push({ text: "No direct relationship supported -- skipping", level: "warning" })
    }
  }

  const production: { text: string; level: LogLine["level"] }[] = [
    { text: "Writing rows to Production sheet...", level: "info" },
    { text: "DOI cache updated", level: "info" },
    { text: "PairDoiSent ledger updated", level: "info" },
    { text: "Staging rows marked resolved", level: "info" },
    { text: "Completed", level: "success" },
  ]

  return { upload: [], taxonomy, search, extraction, production }
}

export interface UseCrawlSimulationResult {
  running: boolean
  finished: boolean
  stageStatus: Record<PipelineStageKey, StageStatus>
  stageProgress: Record<PipelineStageKey, number>
  logs: LogLine[]
  summary: PipelineSummary | null
  evidenceRows: EvidenceRecord[]
  start: () => void
  reset: () => void
}

const initialStatus: Record<PipelineStageKey, StageStatus> = {
  upload: "pending",
  taxonomy: "pending",
  search: "pending",
  extraction: "pending",
  production: "pending",
}
const initialProgress: Record<PipelineStageKey, number> = {
  upload: 0,
  taxonomy: 0,
  search: 0,
  extraction: 0,
  production: 0,
}

export function useCrawlSimulation(uploaded: boolean): UseCrawlSimulationResult {
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [stageStatus, setStageStatus] = useState(initialStatus)
  const [stageProgress, setStageProgress] = useState(initialProgress)
  const [logs, setLogs] = useState<LogLine[]>([])
  const [summary, setSummary] = useState<PipelineSummary | null>(null)
  const [evidenceRows, setEvidenceRows] = useState<EvidenceRecord[]>([])
  const timeouts = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timeouts.current.forEach((id) => window.clearTimeout(id))
    timeouts.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const reset = useCallback(() => {
    clearTimers()
    setRunning(false)
    setFinished(false)
    setStageStatus({ ...initialStatus, upload: uploaded ? "done" : "pending" })
    setStageProgress(initialProgress)
    setLogs([])
    setSummary(null)
    setEvidenceRows([])
  }, [clearTimers, uploaded])

  const start = useCallback(() => {
    if (!uploaded || running) return
    clearTimers()
    setRunning(true)
    setFinished(false)
    setStageStatus({ ...initialStatus, upload: "done" })
    setStageProgress(initialProgress)
    setLogs([])
    setSummary(null)
    setEvidenceRows([])

    const script = buildScript()
    let cumulative = 0

    RUN_STAGES.forEach((stageKey) => {
      const lines = script[stageKey]
      timeouts.current.push(
        window.setTimeout(() => {
          setStageStatus((prev) => ({ ...prev, [stageKey]: "active" }))
        }, cumulative)
      )

      lines.forEach((line, i) => {
        timeouts.current.push(
          window.setTimeout(() => {
            setLogs((prev) => [...prev, { id: logIdCounter++, text: line.text, level: line.level }])
            setStageProgress((prev) => ({ ...prev, [stageKey]: Math.round(((i + 1) / lines.length) * 100) }))
          }, cumulative + i * STEP_MS)
        )
      })

      const stageDuration = lines.length * STEP_MS + STAGE_PAUSE_MS
      timeouts.current.push(
        window.setTimeout(() => {
          setStageStatus((prev) => ({ ...prev, [stageKey]: "done" }))
        }, cumulative + stageDuration)
      )
      cumulative += stageDuration
    })

    timeouts.current.push(
      window.setTimeout(() => {
        const shuffledFound = EVIDENCE_RECORDS.filter((r) => r.resolutionStatus === "FOUND").sort(
          () => Math.random() - 0.5
        )
        const rows = shuffledFound.slice(0, 8)
        setEvidenceRows(rows)
        setSummary({
          ...PIPELINE_SUMMARY,
          evidenceExtracted: rows.length + Math.floor(Math.random() * 6),
          processingTimeSeconds: 180 + Math.floor(Math.random() * 220),
        })
        setRunning(false)
        setFinished(true)
      }, cumulative)
    )
  }, [uploaded, running, clearTimers])

  return { running, finished, stageStatus, stageProgress, logs, summary, evidenceRows, start, reset }
}
