"use client"

import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n/language-provider"
import {
  Home,
  Bike,
  MessageCircle,
  Settings,
  Download,
} from "lucide-react"

interface BottomNavProps {
  activeView: string
  onNavigate: (view: string) => void
}

const navItems = [
  { id: "dashboard", labelKey: "nav.home",    icon: Home },
  { id: "garage",    labelKey: "nav.garage",  icon: Bike },
  { id: "offline",   labelKey: "nav.offline", icon: Download },
  { id: "ai",        labelKey: "nav.ai",      icon: MessageCircle },
  { id: "settings",  labelKey: "nav.settings", icon: Settings },
] as const

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  const { t } = useI18n()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          const label = t(item.labelKey)
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-2 transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={label}
            >
              <Icon className={cn("size-5", isActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
