import { useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CSV_HEADERS, CSV_PREVIEW_ROWS } from "@/data/mock"
import { cn } from "@/lib/utils"
import { UploadCloud, FileSpreadsheet, CheckCircle2, X } from "lucide-react"
import { toast } from "sonner"

const EXPECTED_COLUMNS = ["ISC ID", "Genus", "Species", "Strain", "Target Species"]

export function UploadCsv({
  uploaded,
  fileName,
  onUpload,
  onClear,
}: {
  uploaded: boolean
  fileName: string | null
  onUpload: (name: string) => void
  onClear: () => void
}) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    const name = file?.name ?? "microbe_target_pairs.csv"
    onUpload(name)
    toast.success("CSV uploaded", { description: `${name} · ${CSV_PREVIEW_ROWS.length}+ rows parsed` })
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>1. Input</CardTitle>
        <CardDescription>Upload a CSV of microbe / target invasive species pairs to seed the pipeline.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!uploaded ? (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleFiles(e.dataTransfer.files)
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              dragOver ? "border-teal-600 bg-teal-50/60" : "border-border bg-muted/30"
            )}
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              <UploadCloud className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Drag and drop CSV</p>
              <p className="text-xs text-muted-foreground">or browse files from your computer</p>
            </div>
            <Button onClick={() => inputRef.current?.click()} variant="outline" size="sm">
              Browse Files
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              onClick={() => handleFiles(null)}
              className="text-xs text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              Use sample dataset instead
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-teal-600/20 bg-teal-50/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="size-5 text-teal-600" />
              <div>
                <p className="text-sm font-medium text-foreground">{fileName}</p>
                <p className="text-xs text-teal-700">{CSV_PREVIEW_ROWS.length} rows previewed &middot; parsed successfully</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-teal-600" />
              <Button variant="ghost" size="icon-sm" onClick={onClear}>
                <X className="size-4" />
              </Button>
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Expected columns</p>
          <div className="flex flex-wrap gap-1.5">
            {EXPECTED_COLUMNS.map((col) => (
              <span key={col} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                {col}
              </span>
            ))}
          </div>
        </div>

        {uploaded && (
          <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  {CSV_HEADERS.map((h) => (
                    <TableHead key={h} className="font-mono text-[11px]">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {CSV_PREVIEW_ROWS.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-muted-foreground">{row.iscId}</TableCell>
                    <TableCell className="italic text-foreground">{row.genus}</TableCell>
                    <TableCell className="italic text-foreground">{row.species}</TableCell>
                    <TableCell className="text-muted-foreground">{row.strain || "—"}</TableCell>
                    <TableCell className="italic text-foreground">{row.targetName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
