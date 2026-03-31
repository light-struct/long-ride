"use client"

import * as React from "react"
import type { Lang } from "@/lib/i18n/types"
import { t as translate } from "@/lib/i18n/translate"

type Vars = Record<string, string | number>

type I18nContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string, vars?: Vars) => string
}

const I18nContext = React.createContext<I18nContextValue | null>(null)

const STORAGE_KEY = "lang"
const DEFAULT_LANG: Lang = "ru"

function isLang(v: string | null): v is Lang {
  return v === "ru" || v === "en"
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>(DEFAULT_LANG)

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isLang(stored)) setLangState(stored)
  }, [])

  React.useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = React.useCallback((next: Lang) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const value = React.useMemo<I18nContextValue>(() => {
    return {
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
    }
  }, [lang, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider")
  return ctx
}
