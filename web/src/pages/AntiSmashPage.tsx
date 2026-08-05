import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldPlus, Dna, Atom, TestTubes } from "lucide-react"

export function AntiSmashPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <div className="relative flex size-28 items-center justify-center rounded-3xl bg-teal-50">
        <ShieldPlus className="size-12 text-teal-600" strokeWidth={1.5} />
        <Atom className="absolute -top-2 -right-2 size-8 rounded-full bg-white p-1.5 text-warning-foreground ring-1 ring-warning/40" />
        <TestTubes className="absolute -bottom-1 -left-3 size-8 rounded-full bg-white p-1.5 text-teal-600 ring-1 ring-teal-600/20" />
        <Dna className="absolute top-1/2 -right-8 size-7 -translate-y-1/2 rounded-full bg-white p-1.5 text-muted-foreground ring-1 ring-border" />
      </div>

      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">AntiSMASH Integration</h1>
        <Badge className="bg-warning/25 text-warning-foreground ring-1 ring-warning/40 hover:bg-warning/25">
          Coming Soon
        </Badge>
      </div>
      <p className="max-w-md text-sm text-muted-foreground">
        Genome mining and biosynthetic gene cluster analysis will be integrated here. Scientists will be able to
        submit microbial genomes for secondary metabolite pathway prediction directly from an ISC strain record.
      </p>

      <Button size="lg" disabled className="mt-2">
        Coming Soon
      </Button>

      <div className="mt-4 grid w-full max-w-lg grid-cols-3 gap-3 text-left">
        {[
          { label: "Genome Mining", desc: "Scan assemblies for BGCs" },
          { label: "Cluster Detection", desc: "NRPS, PKS, RiPPs & more" },
          { label: "Metabolite Prediction", desc: "Putative product structures" },
        ].map((f) => (
          <div key={f.label} className="rounded-lg bg-card p-3 ring-1 ring-foreground/10 shadow-sm">
            <p className="text-xs font-medium text-foreground">{f.label}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
