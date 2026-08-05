import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { SeverityBadge, ProximityBadge, StatusBadge } from "@/components/shared/badges"
import type { EvidenceRecord } from "@/data/types"
import { ExternalLink, FlaskConical, Quote, Sparkles, Microscope, Target } from "lucide-react"

export function EvidenceDetailSheet({
  record,
  onOpenChange,
}: {
  record: EvidenceRecord | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={!!record} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg">
        {record && (
          <>
            <SheetHeader className="gap-2 border-b border-border pr-12">
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge status={record.resolutionStatus} />
                <SeverityBadge severity={record.impactSeverity} />
              </div>
              <SheetTitle className="text-base leading-snug">{record.paperName}</SheetTitle>
              <SheetDescription>
                {record.microbeResolvedName} &middot; {record.targetCommonName} &middot; {record.publishedYear}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-5 p-4">
              <section>
                <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Microscope className="size-3.5" /> Abstract
                </h3>
                <p className="text-sm leading-relaxed text-foreground/90">{record.abstract}</p>
              </section>

              <Separator />

              <section className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Target className="size-3.5" /> Matched Subject
                  </h3>
                  <p className="text-sm text-foreground">{record.matchedSubjectInText}</p>
                </div>
                <div>
                  <h3 className="mb-1 text-xs font-medium text-muted-foreground">Taxonomic Proximity</h3>
                  <ProximityBadge proximity={record.taxonomicProximity} />
                </div>
              </section>

              <section>
                <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <FlaskConical className="size-3.5" /> Active Molecules Identified
                </h3>
                {record.activeMoleculesIdentified.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {record.activeMoleculesIdentified.map((m) => (
                      <span key={m} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                        {m}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">None named in text.</p>
                )}
              </section>

              <Separator />

              <section>
                <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Quote className="size-3.5" /> Evidence Quote
                </h3>
                <blockquote className="rounded-lg border-l-2 border-teal-600/40 bg-teal-50/50 px-3 py-2 text-sm italic text-foreground/90">
                  &ldquo;{record.evidenceQuote}&rdquo;
                </blockquote>
              </section>

              <section>
                <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Sparkles className="size-3.5" /> Analyst Interpretation
                </h3>
                <p className="text-sm leading-relaxed text-foreground/90">{record.analystInference}</p>
              </section>

              <Separator />

              <section className="flex items-center justify-between text-xs">
                <div>
                  <p className="text-muted-foreground">DOI</p>
                  <p className="font-mono text-foreground">{record.doi}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={record.sourceUrl} target="_blank" rel="noreferrer">
                    View Source
                    <ExternalLink />
                  </a>
                </Button>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
