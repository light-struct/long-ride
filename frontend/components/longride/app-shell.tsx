"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./sidebar"
import { BottomNav } from "./bottom-nav"
import { useIsMobile } from "@/hooks/use-mobile"

interface AppShellProps {
  children: React.ReactNode
  activeView: string
  onNavigate: (view: string) => void
}

export function AppShell({ children, activeView, onNavigate }: AppShellProps) {
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          activeView={activeView}
          onNavigate={onNavigate}
        />
      )}

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          !isMobile && sidebarOpen ? "ml-64" : !isMobile ? "ml-16" : "ml-0",
          isMobile && "pb-20"
        )}
      >
        <div className="mx-auto max-w-4xl p-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <BottomNav activeView={activeView} onNavigate={onNavigate} />
      )}
    </div>
  )
}
