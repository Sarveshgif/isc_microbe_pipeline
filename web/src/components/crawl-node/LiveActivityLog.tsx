import { useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LogLine } from "@/data/types"
import { Terminal } from "lucide-react"

const LEVEL_STYLES: Record<LogLine["level"], string> = {
  info: "text-slate-300",
  success: "text-emerald-400",
  warning: "text-amber-300",
  error: "text-red-400",
}
const LEVEL_PREFIX: Record<LogLine["level"], string> = {
  info: "›",
  success: "✓",
  warning: "!",
  error: "✕",
}

export function LiveActivityLog({ logs, running }: { logs: LogLine[]; running: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [logs])

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Terminal className="size-4" />
          4. Live Activity
        </CardTitle>
        <CardDescription>Streaming output from the running pipeline.</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          className="h-64 overflow-y-auto rounded-lg bg-slate-950 p-3.5 font-mono text-[12.5px] leading-relaxed"
        >
          {logs.length === 0 ? (
            <p className="text-slate-500">Waiting for pipeline run... start a crawl to see live logs.</p>
          ) : (
            <>
              {logs.map((log) => (
                <div key={log.id} className={cn("flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200", LEVEL_STYLES[log.level])}>
                  <span className="shrink-0 select-none text-slate-600">{LEVEL_PREFIX[log.level]}</span>
                  <span className="break-words">{log.text}</span>
                </div>
              ))}
              {running && (
                <div className="mt-0.5 flex items-center gap-1.5 text-slate-500">
                  <span className="size-1.5 animate-pulse rounded-full bg-teal-500" />
                  <span className="inline-block h-3.5 w-1.5 animate-pulse bg-slate-500" />
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
