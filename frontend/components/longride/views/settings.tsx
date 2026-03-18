"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, User, Moon, Sun, LogOut, CheckCircle2, Database, Cloud, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiSync, tokenStore } from "@/lib/api"
import { getUserNamespace, loadActiveBikeId, loadBikes, pushActivity, saveActiveBikeId, saveBikes } from "@/lib/local-state"
import { apiToLocal, localToApi } from "@/lib/sync-adapter"

interface SettingsProps {
  onLogout: () => void
}

export function Settings({ onLogout }: SettingsProps) {
  const [darkMode, setDarkMode] = React.useState(false)
  const [syncing, setSyncing] = React.useState(false)
  const [lastSynced, setLastSynced] = React.useState<string | null>(null)
  const [justSynced, setJustSynced] = React.useState(false)
  const [syncError, setSyncError] = React.useState("")

  const handleThemeToggle = (checked: boolean) => {
    setDarkMode(checked)
    document.documentElement.classList.toggle("dark", checked)
  }

  const handleSync = async () => {
    setSyncing(true)
    setJustSynced(false)
    setSyncError("")
    try {
      const deviceId = localStorage.getItem("device_id") || (() => {
        const id = crypto.randomUUID()
        localStorage.setItem("device_id", id)
        return id
      })()

      const lastSyncAt = localStorage.getItem("last_sync_at") ?? undefined
      const localBikes = loadBikes()
      const activeBikeId = loadActiveBikeId()
      const payload = localToApi(localBikes, activeBikeId)
      const res = await apiSync(deviceId, payload.bicycles, payload.components, lastSyncAt)

      const merged = apiToLocal(res.bicycles, res.components)
      saveBikes(merged)
      const serverActive = res.bicycles.find((b) => b.is_active)?.id ?? null
      if (serverActive) saveActiveBikeId(serverActive)

      localStorage.setItem("last_sync_at", res.synced_at)
      setLastSynced(new Date(res.synced_at).toLocaleTimeString())
      setJustSynced(true)
      pushActivity("Manual sync completed")
      setTimeout(() => setJustSynced(false), 3000)
    } catch {
      setSyncError("Sync failed. Check your connection.")
    } finally {
      setSyncing(false)
    }
  }

  const handleLogout = () => {
    const ns = getUserNamespace()
    pushActivity("Signed out", ns)
    tokenStore.clear()
    localStorage.removeItem("last_sync_at")
    localStorage.removeItem("device_id")
    localStorage.removeItem("user_email")
    onLogout()
  }

  const userEmail = typeof window !== "undefined"
    ? localStorage.getItem("user_email") ?? "user@longride.app"
    : "user@longride.app"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary">
            <User className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium">My Account</p>
            <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Appearance</p>
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="size-4 text-muted-foreground" /> : <Sun className="size-4 text-muted-foreground" />}
                <Label htmlFor="dark-mode" className="cursor-pointer text-sm font-medium">Dark Mode</Label>
              </div>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={handleThemeToggle} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Engine */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Sync Engine</p>
        <Card>
          <CardContent className="space-y-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                <Database className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Local Database (SQLite)</p>
                <p className="text-xs text-muted-foreground">Healthy</p>
              </div>
              <div className="size-2.5 rounded-full bg-[#10B981]" />
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                <Cloud className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Cloud Sync (PostgreSQL)</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
              <div className="size-2.5 rounded-full bg-[#10B981]" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Last Sync</p>
                <p className="text-xs text-muted-foreground">
                  <span className={cn(justSynced && "text-[#10B981] font-medium")}>
                    {lastSynced ?? "Never synced"}
                  </span>
                </p>
              </div>
              {justSynced && <CheckCircle2 className="size-5 text-[#10B981]" />}
            </div>

            {syncError && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="size-4" />
                <p className="text-xs">{syncError}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground leading-relaxed">
              LongRide uses differential sync — only changed data is transferred, keeping the app fast and working offline.
            </p>

            <Button className="w-full gap-2" onClick={handleSync} disabled={syncing}>
              <RefreshCw className={cn("size-4", syncing && "animate-spin")} />
              {syncing ? "Syncing..." : "FORCE SYNC"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Logout */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Account</p>
        <Card>
          <CardContent className="py-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
