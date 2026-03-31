"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/components/i18n/language-provider"
import {
  Bike,
  MessageCircle,
  ChevronRight,
  Clock,
  Download,
  Plus,
} from "lucide-react"
import {
  formatRelativeTime,
  loadActiveBikeId,
  loadActivity,
  loadBikes,
  type BicycleData,
  type Component,
} from "@/lib/local-state"

function getBikeDistanceKm(bike: BicycleData): number {
  if (!bike.components.length) return 0
  return bike.components.reduce((max, c) => Math.max(max, c.mileage), 0)
}

interface DashboardProps {
  onNavigate: (view: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { t } = useI18n()
  const [bikes, setBikes] = React.useState<BicycleData[]>([])
  const [activeBikeId, setActiveBikeId] = React.useState<string | null>(null)
  const [activity, setActivity] = React.useState(loadActivity())

  React.useEffect(() => {
    const loaded = loadBikes()
    setBikes(loaded)
    setActiveBikeId(loadActiveBikeId())
    setActivity(loadActivity())
  }, [])

  const activeBike =
    (activeBikeId ? bikes.find((b) => b.id === activeBikeId) : null) ??
    bikes[0] ??
    null

  const otherBikes = activeBike ? bikes.filter((b) => b.id !== activeBike.id) : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      {/* Primary Bike Card */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{t("dashboard.activeBicycle")}</p>
        {activeBike ? (
          (() => {
            const km = getBikeDistanceKm(activeBike)
            return (
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <Bike className="size-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold leading-tight">{activeBike.name}</h2>
                      </div>
                      <p className="text-sm text-muted-foreground">{activeBike.type}</p>
                      <p className="mt-3 text-2xl font-semibold tracking-tight">{km.toLocaleString()} km</p>
                      <p className="text-xs text-muted-foreground">{t("dashboard.totalDistance")}</p>
                      <p className="mt-4 text-sm text-muted-foreground">
                        {t("dashboard.componentsCount", { count: activeBike.components.length })}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 h-8 w-full text-xs text-muted-foreground"
                    onClick={() => onNavigate("garage")}
                  >
                    {t("dashboard.viewTechState")}
                    <ChevronRight className="ml-1 size-3.5" />
                  </Button>
                </CardContent>
              </Card>
            )
          })()
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Bike className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{t("dashboard.noBikes.title")}</p>
                  <p className="text-sm text-muted-foreground">{t("dashboard.noBikes.subtitle")}</p>
                  <Button className="mt-4 gap-2" onClick={() => onNavigate("garage")}>
                    <Plus className="size-4" />
                    {t("dashboard.addBike")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{t("dashboard.quickActions")}</p>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => onNavigate("garage")}
          >
            <Bike className="size-5" />
            <span className="text-xs font-medium">{t("dashboard.manageBikes")}</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => onNavigate("ai")}
          >
            <MessageCircle className="size-5" />
            <span className="text-xs font-medium">{t("dashboard.aiAssistant")}</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => onNavigate("offline")}
          >
            <Download className="size-5" />
            <span className="text-xs font-medium">{t("dashboard.offlineAvailable")}</span>
          </Button>
        </div>
      </div>

      {/* Other Bicycles — horizontal scroll */}
      {otherBikes.length > 0 && (
	        <div className="space-y-3">
	          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{t("dashboard.otherBicycles")}</p>
	          <div className="flex gap-3 overflow-x-auto pb-1 -mx-6 px-6">
	            {otherBikes.map((bike) => {
	              const km = getBikeDistanceKm(bike)
	              return (
	                <button
	                  key={bike.id}
	                  onClick={() => onNavigate("garage")}
	                  className="flex shrink-0 cursor-pointer items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-secondary/50 text-left"
	                  style={{ minWidth: 200 }}
	                >
	                  <div className="min-w-0">
	                    <p className="truncate text-sm font-medium">{bike.name}</p>
	                    <p className="truncate text-xs text-muted-foreground">{km.toLocaleString()} km</p>
	                  </div>
	                  <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
	                </button>
	              )
	            })}
	          </div>
	        </div>
	      )}

      {/* Recent Activity */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{t("dashboard.recentActivity")}</p>
        <Card>
          <CardContent className="divide-y py-0">
            {activity.length ? (
              activity.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <Clock className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm">{item.action}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(item.at)}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-sm text-muted-foreground">{t("dashboard.noActivity")}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
