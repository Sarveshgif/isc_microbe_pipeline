import { Route, Routes } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { HomePage } from "@/pages/HomePage"
import { CrawlNodePage } from "@/pages/CrawlNodePage"
import { AntiSmashPage } from "@/pages/AntiSmashPage"
import { EvidenceDatabasePage } from "@/pages/EvidenceDatabasePage"
import { PipelineStatusPage } from "@/pages/PipelineStatusPage"
import { SettingsPage } from "@/pages/SettingsPage"

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/crawl-node" element={<CrawlNodePage />} />
        <Route path="/antismash" element={<AntiSmashPage />} />
        <Route path="/evidence" element={<EvidenceDatabasePage />} />
        <Route path="/pipeline-status" element={<PipelineStatusPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App
