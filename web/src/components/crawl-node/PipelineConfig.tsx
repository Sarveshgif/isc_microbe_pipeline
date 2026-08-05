import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { SlidersHorizontal } from "lucide-react"

const LLM_MODELS = [
  { value: "qwen2.5:3b", label: "qwen2.5:3b (default, fast)" },
  { value: "llama3.1:8b", label: "llama3.1:8b" },
  { value: "mistral:7b", label: "mistral:7b" },
  { value: "phi3:mini", label: "phi3:mini" },
]

interface ConfigRow {
  key: string
  label: string
  description: string
}

const TOGGLES: ConfigRow[] = [
  { key: "taxonomy", label: "Enable Taxonomy Resolution", description: "Resolve microbes via NCBI and targets via GBIF" },
  { key: "synonyms", label: "Use synonym expansion", description: "Expand search terms with the resolved synonym cloud" },
  { key: "dedupe", label: "Deduplicate canonical pairs", description: "Merge raw rows that resolve to the same pair" },
  { key: "openalex", label: "Run OpenAlex search", description: "Query the tiered literature search" },
  { key: "llm", label: "Use LLM extraction", description: "Extract structured evidence with a local model" },
]

export function PipelineConfig() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    taxonomy: true,
    synonyms: true,
    dedupe: true,
    openalex: true,
    llm: true,
  })
  const [confidence, setConfidence] = useState([80])
  const [model, setModel] = useState("qwen2.5:3b")

  function toggle(key: string, value: boolean) {
    setToggles((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>2. Pipeline Configuration</CardTitle>
        <CardDescription>Fine-tune each stage before launching a run.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {TOGGLES.map((row, idx) => {
          const disabled =
            (row.key === "synonyms" && !toggles.taxonomy) || (row.key === "llm" && !toggles.openalex)
          return (
            <div key={row.key}>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <div className="min-w-0">
                  <Label htmlFor={row.key} className="text-sm font-normal text-foreground">
                    {row.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{row.description}</p>
                </div>
                <Switch
                  id={row.key}
                  checked={toggles[row.key] && !disabled}
                  disabled={disabled}
                  onCheckedChange={(v) => toggle(row.key, v)}
                />
              </div>
              {idx < TOGGLES.length - 1 && <Separator />}
            </div>
          )
        })}

        <Separator className="my-3" />

        <div className="py-2">
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-sm font-normal text-foreground">GBIF Match Confidence Threshold</Label>
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
              {confidence[0]}%
            </span>
          </div>
          <Slider value={confidence} min={50} max={100} step={1} onValueChange={setConfidence} />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Fuzzy taxonomy matches below this threshold are flagged for manual review.
          </p>
        </div>

        <Separator className="my-1" />

        <div className="py-2">
          <Label className="mb-2 flex items-center gap-1.5 text-sm font-normal text-foreground">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            Ollama Model
          </Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LLM_MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1.5 text-xs text-muted-foreground">Runs locally via Ollama &mdash; mocked in this prototype.</p>
        </div>
      </CardContent>
    </Card>
  )
}
