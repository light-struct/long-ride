"use client"

import { Card, CardContent } from "@/components/ui/card"

export function About() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">About Us</h1>
        <p className="text-sm text-muted-foreground">What is LongRide</p>
      </div>

      <Card>
        <CardContent className="space-y-4 py-6">
          <div>
            <p className="text-sm leading-relaxed">
              LongRide is a bicycle maintenance tracker designed to help riders keep components in a safe working
              condition, log mileage, and stay consistent with service intervals.
            </p>
          </div>

          <div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Core ideas:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Track bicycles and component wear over time</li>
              <li>Offline-first workflow with periodic sync</li>
              <li>AI mechanic assistant for common repair questions</li>
            </ul>
          </div>

          <div className="rounded-lg border bg-secondary/40 p-4">
            <p className="text-sm font-medium">Contact</p>
            <p className="text-sm text-muted-foreground">longride.app (demo project)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

