import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dna, ShieldPlus, ArrowRight, Microscope, FlaskConical, Leaf } from "lucide-react"

export function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-teal-700 via-teal-600 to-teal-600 py-10 text-white ring-0 shadow-sm sm:py-14">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden>
          <Microscope className="absolute -top-6 right-10 size-40 rotate-12" />
          <Leaf className="absolute bottom-0 left-1/3 size-28 -rotate-12" />
        </div>
        <CardContent className="relative px-6 sm:px-12">
          <Badge className="mb-4 bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/15">
            Internal Research Platform
          </Badge>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Crawl Node</h1>
          <p className="mt-3 max-w-xl text-sm text-teal-50/90 sm:text-base">
            Scientific literature discovery platform for microbial biocontrol evidence. Launch tiered literature
            searches, resolve taxonomy against NCBI and GBIF, and extract structured evidence with an LLM pipeline —
            all in one workflow.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-teal-700 hover:bg-white/90">
              <Link to="/crawl-node">
                Launch Crawl Node
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              <Link to="/evidence">Browse Evidence Database</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="flex flex-col shadow-sm transition-all hover:shadow-md">
          <CardHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Dna className="size-5.5" />
            </div>
            <CardTitle className="text-lg">Crawl Node</CardTitle>
            <CardDescription className="text-[13px] leading-relaxed">
              Discover literature showing antagonistic, inhibitory, toxic or biocontrol relationships between
              microbes and invasive species.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex items-center justify-between gap-3 pt-2">
            <ul className="hidden text-xs text-muted-foreground sm:block">
              <li>Taxonomy resolution &middot; OpenAlex search &middot; LLM extraction</li>
            </ul>
            <Button asChild className="ml-auto">
              <Link to="/crawl-node">
                Launch Crawl Node
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col shadow-sm transition-all hover:shadow-md">
          <CardHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <ShieldPlus className="size-5.5" />
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">AntiSMASH</CardTitle>
              <Badge className="bg-warning/25 text-warning-foreground ring-1 ring-warning/40 hover:bg-warning/25">
                Coming Soon
              </Badge>
            </div>
            <CardDescription className="text-[13px] leading-relaxed">
              Analyze microbial genomes for biosynthetic gene clusters and secondary metabolite potential.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex items-center justify-between gap-3 pt-2">
            <ul className="hidden text-xs text-muted-foreground sm:block">
              <li>Genome mining &middot; BGC detection &middot; Metabolite prediction</li>
            </ul>
            <Button disabled className="ml-auto">
              Launch AntiSMASH
              <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <FlaskConical className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">New to Crawl Node?</p>
            <p className="text-xs text-muted-foreground">
              Review how the pipeline moves data from a raw CSV to production evidence on the Pipeline Status page.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/pipeline-status">View Architecture</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
