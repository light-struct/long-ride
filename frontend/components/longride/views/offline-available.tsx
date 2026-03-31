"use client"

import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { loadOfflineCollection } from "@/lib/offline-content/load"
import type { OfflineCollection, OfflineTopic } from "@/lib/offline-content/schema"
import { pickLocalized } from "@/lib/i18n/localized"
import { useI18n } from "@/components/i18n/language-provider"

import repairJson from "@/lib/offline-content/data/repair-guides.json"
import trainingJson from "@/lib/offline-content/data/training-guides.json"
import nutritionJson from "@/lib/offline-content/data/nutrition-guides.json"
import { BookOpen, Dumbbell, Utensils } from "lucide-react"

function badgeClass(badge: string): string {
  switch (badge) {
    case "Easy":
      return "bg-green-500/10 text-green-600 hover:bg-green-500/10"
    case "Medium":
      return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/10"
    case "Hard":
      return "bg-red-500/10 text-red-600 hover:bg-red-500/10"
    default:
      return ""
  }
}

function TopicCard({ topic }: { topic: OfflineTopic }) {
  const { lang } = useI18n()
  return (
    <Card className="bg-background">
      <CardContent className="p-4 space-y-4">
        {topic.summary && <p className="text-sm text-muted-foreground">{pickLocalized(topic.summary, lang)}</p>}
        {topic.sections.map((section, sectionIdx) => {
          const kind = section.kind ?? "ul"
          const ListTag = kind === "ol" ? "ol" : "ul"
          return (
            <div key={`${topic.id}:section:${sectionIdx}`} className="space-y-2">
              <p className="text-sm font-medium">{pickLocalized(section.heading, lang)}</p>
              <ListTag className={cn("space-y-2 text-sm leading-relaxed", kind === "ol" ? "list-decimal pl-5" : "list-disc pl-5")}>
                {section.items.map((item, idx) => (
                  <li key={`${topic.id}:${sectionIdx}:${idx}`}>{pickLocalized(item, lang)}</li>
                ))}
              </ListTag>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function CollectionView({ collection }: { collection: OfflineCollection }) {
  const { lang, t } = useI18n()
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">{pickLocalized(collection.description, lang)}</p>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {collection.categories.map((category) => (
          <AccordionItem
            key={category.id}
            value={category.id}
            className="rounded-lg border px-4 last:border-b"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <span className="font-semibold">{pickLocalized(category.name, lang)}</span>
                <span className="text-sm text-muted-foreground">({t("offline.topicsCount", { count: category.topics.length })})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Accordion type="single" collapsible className="space-y-2">
                {category.topics.map((topic) => (
                  <AccordionItem
                    key={topic.id}
                    value={topic.id}
                    className="rounded-md border-0 bg-secondary/50"
                  >
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex w-full items-center gap-2">
                        <span className="text-sm font-medium">{pickLocalized(topic.title, lang)}</span>
                        <span className="flex-1" />
                        {topic.badges?.map((b) => (
                          <Badge key={`${topic.id}:${b}`} variant="secondary" className={badgeClass(b)}>
                            {(() => {
                              if (b === "Easy" || b === "Medium" || b === "Hard") return t(`difficulty.${b}`)
                              const k = `badge.${b}`
                              const maybe = t(k)
                              return maybe === k ? b : maybe
                            })()}
                          </Badge>
                        ))}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <TopicCard topic={topic} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">{t("offline.notice.title")}</p>
            <p className="text-xs text-muted-foreground">
              {t("offline.notice.subtitle")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function OfflineAvailable() {
  const { t } = useI18n()
  const repair = React.useMemo(() => loadOfflineCollection(repairJson, "repair-guides.json"), [])
  const training = React.useMemo(() => loadOfflineCollection(trainingJson, "training-guides.json"), [])
  const nutrition = React.useMemo(() => loadOfflineCollection(nutritionJson, "nutrition-guides.json"), [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("offline.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("offline.subtitle")}
        </p>
      </div>

      <Tabs defaultValue="repair" className="flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="repair" className="flex-1 gap-2">
            <BookOpen className="size-4" />{t("offline.tab.repair")}
          </TabsTrigger>
          <TabsTrigger value="training" className="flex-1 gap-2">
            <Dumbbell className="size-4" />{t("offline.tab.training")}
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex-1 gap-2">
            <Utensils className="size-4" />{t("offline.tab.nutrition")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="repair" className="mt-4">
          <CollectionView collection={repair} />
        </TabsContent>
        <TabsContent value="training" className="mt-4">
          <CollectionView collection={training} />
        </TabsContent>
        <TabsContent value="nutrition" className="mt-4">
          <CollectionView collection={nutrition} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
