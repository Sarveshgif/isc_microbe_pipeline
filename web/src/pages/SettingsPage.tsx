import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { SERVICE_CONNECTIONS } from "@/data/mock"
import type { ConnectionStatus } from "@/data/types"
import { Table2, Search, Dna, Leaf, Cpu, CircleCheck, CircleAlert, CircleX } from "lucide-react"

const ICONS: Record<string, typeof Table2> = {
  "google-sheets": Table2,
  openalex: Search,
  ncbi: Dna,
  gbif: Leaf,
  ollama: Cpu,
}

const STATUS_META: Record<ConnectionStatus, { label: string; className: string; Icon: typeof CircleCheck }> = {
  connected: { label: "Connected", className: "text-teal-700 bg-teal-100 ring-teal-600/20", Icon: CircleCheck },
  warning: { label: "Degraded", className: "text-warning-foreground bg-warning/25 ring-warning/40", Icon: CircleAlert },
  disconnected: { label: "Disconnected", className: "text-destructive bg-destructive/10 ring-destructive/20", Icon: CircleX },
}

export function SettingsPage() {
  const [connections, setConnections] = useState(SERVICE_CONNECTIONS)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage connections for the external services the pipeline depends on.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {connections.map((conn) => {
          const Icon = ICONS[conn.id] ?? Table2
          const status = STATUS_META[conn.status]
          const StatusIcon = status.Icon
          return (
            <Card key={conn.id} className="shadow-sm transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Icon className="size-4.5" />
                    </span>
                    <div>
                      <CardTitle>{conn.name}</CardTitle>
                      <CardDescription className="text-[13px]">{conn.description}</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={conn.enabled}
                    onCheckedChange={(checked) =>
                      setConnections((prev) => prev.map((c) => (c.id === conn.id ? { ...c, enabled: checked } : c)))
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-3" />
                <div className="flex items-center justify-between text-xs">
                  <code className="rounded bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
                    {conn.endpoint}
                  </code>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ring-1",
                      status.className
                    )}
                  >
                    <StatusIcon className="size-3" />
                    {status.label}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground/70">Last checked {conn.lastChecked}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
