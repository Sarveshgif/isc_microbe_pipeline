import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: "teal" | "yellow" | "red" | "neutral"
  hint?: string
  className?: string
  loading?: boolean
}

const TONE_STYLES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  teal: "bg-teal-50 text-teal-700",
  yellow: "bg-warning/25 text-warning-foreground",
  red: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
}

export function StatCard({ label, value, icon: Icon, tone = "neutral", hint, className, loading }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5",
        className
      )}
    >
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", TONE_STYLES[tone])}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        {loading ? (
          <Skeleton className="h-7 w-12" />
        ) : (
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        )}
        <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-muted-foreground/70">{hint}</p>}
      </div>
    </div>
  )
}
