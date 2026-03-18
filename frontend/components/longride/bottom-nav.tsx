"use client"

import { cn } from "@/lib/utils"
import {
  Home,
  Bike,
  MessageCircle,
  Settings,
  Info,
} from "lucide-react"

interface BottomNavProps {
  activeView: string
  onNavigate: (view: string) => void
}

const navItems = [
  { id: "dashboard", label: "Home",     icon: Home },
  { id: "garage",    label: "Garage",   icon: Bike },
  { id: "ai",        label: "AI",       icon: MessageCircle },
  { id: "about",     label: "About",    icon: Info },
  { id: "settings",  label: "Settings", icon: Settings },
]

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-2 transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
            >
              <Icon className={cn("size-5", isActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
