import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EvidenceTable, evidenceStrength, type SortDir, type SortKey } from "@/components/shared/EvidenceTable"
import { EvidenceDetailSheet } from "@/components/shared/EvidenceDetailSheet"
import { EVIDENCE_RECORDS, MICROBES, TARGETS } from "@/data/mock"
import type { EvidenceRecord, ImpactSeverity, ResolutionStatus } from "@/data/types"
import { Search, X, FileStack } from "lucide-react"

const PAGE_SIZE = 8

export function EvidenceDatabasePage() {
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<ResolutionStatus | "all">("all")
  const [severity, setSeverity] = useState<ImpactSeverity | "all">("all")
  const [target, setTarget] = useState<string>("all")
  const [microbe, setMicrobe] = useState<string>("all")
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "year", dir: "desc" })
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<EvidenceRecord | null>(null)

  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 550)
    return () => window.clearTimeout(id)
  }, [])

  const filtered = useMemo(() => {
    let rows = EVIDENCE_RECORDS.filter((r) => {
      if (status !== "all" && r.resolutionStatus !== status) return false
      if (severity !== "all" && r.impactSeverity !== severity) return false
      if (target !== "all" && r.targetInvasiveProfile !== target) return false
      if (microbe !== "all" && r.microbeOfInterest.iscId !== microbe) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        const haystack = `${r.microbeResolvedName} ${r.targetCommonName} ${r.targetInvasiveProfile} ${r.paperName}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    rows = [...rows].sort((a, b) => {
      let cmp = 0
      switch (sort.key) {
        case "microbe":
          cmp = a.microbeResolvedName.localeCompare(b.microbeResolvedName)
          break
        case "target":
          cmp = a.targetCommonName.localeCompare(b.targetCommonName)
          break
        case "strength":
          cmp = evidenceStrength(a.matchedViaTier).rank - evidenceStrength(b.matchedViaTier).rank
          break
        case "severity": {
          const order: ImpactSeverity[] = ["Watch List", "Limited", "Moderate", "High"]
          cmp = order.indexOf(a.impactSeverity) - order.indexOf(b.impactSeverity)
          break
        }
        case "year":
          cmp = a.publishedYear - b.publishedYear
          break
      }
      return sort.dir === "asc" ? cmp : -cmp
    })

    return rows
  }, [query, status, severity, target, microbe, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSortChange(key: SortKey) {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))
    setPage(1)
  }

  function resetFilters() {
    setQuery("")
    setStatus("all")
    setSeverity("all")
    setTarget("all")
    setMicrobe("all")
    setPage(1)
  }

  const hasActiveFilters = status !== "all" || severity !== "all" || target !== "all" || microbe !== "all" || !!query

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
            <FileStack className="size-6 text-teal-600" />
            Evidence Database
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} of {EVIDENCE_RECORDS.length} records
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-card p-3 shadow-sm ring-1 ring-foreground/10 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search microbe, target, or paper title..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={status} onValueChange={(v) => { setStatus(v as typeof status); setPage(1) }}>
            <SelectTrigger size="sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="FOUND">Found</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="NO_RELATION_FOUND">No Relation Found</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severity} onValueChange={(v) => { setSeverity(v as typeof severity); setPage(1) }}>
            <SelectTrigger size="sm"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Moderate">Moderate</SelectItem>
              <SelectItem value="Limited">Limited</SelectItem>
              <SelectItem value="Watch List">Watch List</SelectItem>
            </SelectContent>
          </Select>

          <Select value={target} onValueChange={(v) => { setTarget(v); setPage(1) }}>
            <SelectTrigger size="sm"><SelectValue placeholder="Target" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Targets</SelectItem>
              {TARGETS.map((t) => (
                <SelectItem key={t.name} value={t.name}>{t.common}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={microbe} onValueChange={(v) => { setMicrobe(v); setPage(1) }}>
            <SelectTrigger size="sm"><SelectValue placeholder="Microbe" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Microbes</SelectItem>
              {MICROBES.map((m) => (
                <SelectItem key={m.iscId} value={m.iscId}>{m.genus} {m.species}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X /> Clear
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2 overflow-hidden rounded-xl ring-1 ring-foreground/10 p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <EvidenceTable records={pageRows} onRowClick={setSelected} sort={sort} onSortChange={handleSortChange} />
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>

      <EvidenceDetailSheet record={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  )
}
