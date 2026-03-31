import type { Lang } from "./types"

export type LocalizedString = string | { ru: string; en: string }

export function pickLocalized(value: LocalizedString | undefined, lang: Lang): string {
  if (!value) return ""
  if (typeof value === "string") return value
  return value[lang]
}

