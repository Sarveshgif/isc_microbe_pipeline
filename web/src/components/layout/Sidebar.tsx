import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Home, Dna, ShieldPlus, FileStack, ActivitySquare, Settings } from "lucide-react"

export const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/crawl-node", label: "Crawl Node", icon: Dna },
  { to: "/antismash", label: "AntiSMASH", icon: ShieldPlus },
  { to: "/evidence", label: "Evidence Database", icon: FileStack },
  { to: "/pipeline-status", label: "Pipeline Status", icon: ActivitySquare },
  { to: "/settings", label: "Settings", icon: Settings },
]

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )
          }
        >
          <item.icon className="size-4 shrink-0" />
          <span className="truncate">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-4 md:flex">
      <NavLinks />
      <div className="mt-auto rounded-lg bg-teal-50 p-3 text-xs text-teal-700">
        <p className="font-medium">Proof of Concept</p>
        <p className="mt-0.5 text-teal-700/70">All pipeline data shown is simulated for demonstration.</p>
      </div>
    </aside>
  )
}
