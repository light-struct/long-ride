import { dict } from "./dict"
import type { Lang } from "./types"

type Vars = Record<string, string | number>

function format(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`))
}

export function t(lang: Lang, key: string, vars?: Vars): string {
  const entry = dict[key]
  if (!entry) return format(key, vars)
  return format(entry[lang], vars)
}

