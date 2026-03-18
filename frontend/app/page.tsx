"use client"

import * as React from "react"
import { Auth } from "@/components/longride/views/auth"
import { AppShell } from "@/components/longride/app-shell"
import { Dashboard } from "@/components/longride/views/dashboard"
import { Garage } from "@/components/longride/views/garage"
import { AIAssistant } from "@/components/longride/views/ai-assistant"
import { Settings } from "@/components/longride/views/settings"
import { About } from "@/components/longride/views/about"

export default function Home() {
  const [authReady, setAuthReady] = React.useState(false)
  const [authenticated, setAuthenticated] = React.useState(false)
  const [activeView, setActiveView] = React.useState("dashboard")

  React.useEffect(() => {
    // Persist login across page reloads.
    const access = localStorage.getItem("access_token")
    const refresh = localStorage.getItem("refresh_token")
    setAuthenticated(Boolean(access || refresh))
    setAuthReady(true)
  }, [])

  if (!authReady) return null

  if (!authenticated) return <Auth onAuthenticated={() => setAuthenticated(true)} />

  const renderView = () => {
    switch (activeView) {
      case "dashboard": return <Dashboard onNavigate={setActiveView} />
      case "garage":    return <Garage />
      case "ai":        return <AIAssistant />
      case "about":     return <About />
      case "settings":  return <Settings onLogout={() => setAuthenticated(false)} />
      default:          return <Dashboard onNavigate={setActiveView} />
    }
  }

  return (
    <AppShell activeView={activeView} onNavigate={setActiveView}>
      {renderView()}
    </AppShell>
  )
}
