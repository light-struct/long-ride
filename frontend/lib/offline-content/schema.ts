import { z } from "zod"

const LocalizedStringSchema = z.union([
  z.string().min(1),
  z.object({
    ru: z.string().min(1),
    en: z.string().min(1),
  }),
])

export const OfflineSectionSchema = z.object({
  heading: LocalizedStringSchema,
  kind: z.enum(["ol", "ul"]).optional(),
  items: z.array(LocalizedStringSchema).min(1),
})

export const OfflineTopicSchema = z.object({
  id: z.string().min(1),
  title: LocalizedStringSchema,
  summary: LocalizedStringSchema.optional(),
  badges: z.array(z.string().min(1)).optional(),
  sections: z.array(OfflineSectionSchema).min(1),
})

export const OfflineCategorySchema = z.object({
  id: z.string().min(1),
  name: LocalizedStringSchema,
  topics: z.array(OfflineTopicSchema).min(1),
})

export const OfflineCollectionSchema = z.object({
  title: LocalizedStringSchema,
  description: LocalizedStringSchema.optional(),
  categories: z.array(OfflineCategorySchema).min(1),
})

export type OfflineSection = z.infer<typeof OfflineSectionSchema>
export type OfflineTopic = z.infer<typeof OfflineTopicSchema>
export type OfflineCategory = z.infer<typeof OfflineCategorySchema>
export type OfflineCollection = z.infer<typeof OfflineCollectionSchema>

export type LocalizedString = z.infer<typeof LocalizedStringSchema>
