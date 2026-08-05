import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SeverityBadge, ProximityBadge, StatusBadge } from "@/components/shared/badges"
import { cn } from "@/lib/utils"
import type { EvidenceRecord } from "@/data/types"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

export type SortKey = "microbe" | "target" | "strength" | "severity" | "year"
export type SortDir = "asc" | "desc"

const STRENGTH_BY_TIER: Record<number, { label: string; rank: number; className: string }> = {
  1: { label: "Strong", rank: 3, className: "bg-teal-100 text-teal-700 ring-teal-600/20" },
  2: { label: "Moderate", rank: 2, className: "bg-secondary text-secondary-foreground ring-border" },
  3: { label: "Weak", rank: 1, className: "bg-warning/25 text-warning-foreground ring-warning/40" },
  4: { label: "Indirect", rank: 0, className: "bg-muted text-muted-foreground ring-border" },
}

export function evidenceStrength(tier: number) {
  return STRENGTH_BY_TIER[tier] ?? STRENGTH_BY_TIER[4]
}

interface EvidenceTableProps {
  records: EvidenceRecord[]
  onRowClick: (record: EvidenceRecord) => void
  sort?: { key: SortKey; dir: SortDir }
  onSortChange?: (key: SortKey) => void
}

function SortableHead({
  label,
  sortKey,
  sort,
  onSortChange,
  className,
}: {
  label: string
  sortKey: SortKey
  sort?: { key: SortKey; dir: SortDir }
  onSortChange?: (key: SortKey) => void
  className?: string
}) {
  if (!onSortChange) return <TableHead className={className}>{label}</TableHead>
  const active = sort?.key === sortKey
  const Icon = active ? (sort!.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <TableHead className={className}>
      <button
        onClick={() => onSortChange(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 rounded transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        <Icon className="size-3" />
      </button>
    </TableHead>
  )
}

export function EvidenceTable({ records, onRowClick, sort, onSortChange }: EvidenceTableProps) {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <SortableHead label="Microbe" sortKey="microbe" sort={sort} onSortChange={onSortChange} />
            <SortableHead label="Target" sortKey="target" sort={sort} onSortChange={onSortChange} />
            <SortableHead label="Evidence Strength" sortKey="strength" sort={sort} onSortChange={onSortChange} />
            <SortableHead label="Severity" sortKey="severity" sort={sort} onSortChange={onSortChange} />
            <TableHead>Taxonomic Match</TableHead>
            <TableHead>Paper Title</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((r) => {
            const strength = evidenceStrength(r.matchedViaTier)
            return (
              <TableRow
                key={r.id}
                onClick={() => onRowClick(r)}
                className="cursor-pointer"
              >
                <TableCell className="font-medium text-foreground">
                  <span className="italic">{r.microbeResolvedName}</span>
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">{r.microbeOfInterest.iscId}</span>
                </TableCell>
                <TableCell>
                  <span className="text-foreground">{r.targetCommonName}</span>
                  <span className="block text-xs italic text-muted-foreground">{r.targetInvasiveProfile}</span>
                </TableCell>
                <TableCell>
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1", strength.className)}>
                    {strength.label}
                  </span>
                </TableCell>
                <TableCell>
                  <SeverityBadge severity={r.impactSeverity} />
                </TableCell>
                <TableCell>
                  <ProximityBadge proximity={r.taxonomicProximity} />
                </TableCell>
                <TableCell className="max-w-64 truncate whitespace-nowrap text-foreground/90">{r.paperName}</TableCell>
                <TableCell>
                  <StatusBadge status={r.resolutionStatus} />
                </TableCell>
              </TableRow>
            )
          })}
          {records.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                No records match the current filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
