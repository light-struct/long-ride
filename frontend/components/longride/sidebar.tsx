"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  Bike,
  MessageCircle,
  Settings,
  Menu,
  X,
  Info,
} from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  activeView: string
  onNavigate: (view: string) => void
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "garage",    label: "Garage",    icon: Bike },
  { id: "ai",        label: "AI Mechanic", icon: MessageCircle },
  { id: "about",     label: "About Us", icon: Info },
]

const bottomItems = [
  { id: "settings", label: "Settings", icon: Settings },
]

export function Sidebar({ isOpen, onToggle, activeView, onNavigate }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-background transition-all duration-300",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* Toggle */}
      <div className="flex h-14 items-center border-b px-3">
        {isOpen && (
          <span className="flex-1 pl-1 text-base font-semibold tracking-tight">LongRide</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(!isOpen && "mx-auto")}
          aria-label="Toggle sidebar"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1 p-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn("justify-start gap-3", !isOpen && "justify-center px-0")}
              onClick={() => onNavigate(item.id)}
            >
              <Icon className="size-5 shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </Button>
          )
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="border-t p-2">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-3", !isOpen && "justify-center px-0")}
              onClick={() => onNavigate(item.id)}
            >
              <Icon className="size-5 shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </Button>
          )
        })}
      </div>
    </aside>
  )
}
