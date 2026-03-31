"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/components/i18n/language-provider"

export function About() {
  const { t } = useI18n()
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("about.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("about.subtitle")}</p>
      </div>

      <Card>
        <CardContent className="space-y-4 py-6">
          <div>
            <p className="text-sm leading-relaxed">
              {t("about.p1")}
            </p>
          </div>

          <div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("about.core")}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>{t("about.li1")}</li>
              <li>{t("about.li2")}</li>
              <li>{t("about.li3")}</li>
            </ul>
          </div>

          <div className="rounded-lg border bg-secondary/40 p-4">
            <p className="text-sm font-medium">{t("about.contact")}</p>
            <p className="text-sm text-muted-foreground">longride.app (demo project)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
