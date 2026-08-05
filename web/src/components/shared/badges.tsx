import { cn } from "@/lib/utils"
import type { ImpactSeverity, ResolutionStatus, TaxonomicProximity } from "@/data/types"
import { AlertTriangle, CheckCircle2, Circle, Eye } from "lucide-react"

const SEVERITY_STYLES: Record<ImpactSeverity, string> = {
  High: "bg-destructive/10 text-destructive ring-destructive/20",
  Moderate: "bg-warning/25 text-warning-foreground ring-warning/40",
  Limited: "bg-teal-100 text-teal-700 ring-teal-600/20",
  "Watch List": "bg-muted text-muted-foreground ring-border",
}

export function SeverityBadge({ severity, className }: { severity: ImpactSeverity; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1",
        SEVERITY_STYLES[severity],
        className
      )}
    >
      {severity}
    </span>
  )
}

const STATUS_META: Record<
  ResolutionStatus,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  FOUND: { label: "Found", className: "bg-teal-100 text-teal-700 ring-teal-600/20", Icon: CheckCircle2 },
  PENDING: { label: "Pending", className: "bg-warning/25 text-warning-foreground ring-warning/40", Icon: Circle },
  NO_RELATION_FOUND: {
    label: "No Relation Found",
    className: "bg-muted text-muted-foreground ring-border",
    Icon: Eye,
  },
}

export function StatusBadge({ status, className }: { status: ResolutionStatus; className?: string }) {
  const meta = STATUS_META[status]
  const Icon = meta.Icon
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1",
        meta.className,
        className
      )}
    >
      <Icon className="size-3" />
      {meta.label}
    </span>
  )
}

const PROXIMITY_STYLES: Record<TaxonomicProximity, string> = {
  "Exact Match": "bg-teal-100 text-teal-700 ring-teal-600/20",
  "Genus-Level Relative": "bg-secondary text-secondary-foreground ring-border",
  "Family-Level Relative": "bg-secondary text-secondary-foreground ring-border",
  "Bioactivity Match (No Taxonomic Reference)": "bg-warning/25 text-warning-foreground ring-warning/40",
}

export function ProximityBadge({ proximity, className }: { proximity: TaxonomicProximity; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1",
        PROXIMITY_STYLES[proximity],
        className
      )}
    >
      {proximity === "Bioactivity Match (No Taxonomic Reference)" && <AlertTriangle className="size-3" />}
      {proximity}
    </span>
  )
}
