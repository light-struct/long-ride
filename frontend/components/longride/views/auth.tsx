"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiLogin, apiRegister, tokenStore } from "@/lib/api"
import { useI18n } from "@/components/i18n/language-provider"
import type { Lang } from "@/lib/i18n/types"
import { cn } from "@/lib/utils"

type AuthMode = "login" | "register" | "forgot"

interface AuthProps {
  onAuthenticated: () => void
}

export function Auth({ onAuthenticated }: AuthProps) {
  const { lang, setLang, t } = useI18n()
  const [mode, setMode] = React.useState<AuthMode>("login")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [forgotSent, setForgotSent] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (mode === "forgot") {
      setForgotSent(true)
      return
    }

    if (mode === "register" && password !== confirmPassword) {
      setError(t("auth.err.passwordsMismatch"))
      return
    }

    setLoading(true)
    try {
      const res = mode === "register"
        ? await apiRegister(email, password)
        : await apiLogin(email, password)

      tokenStore.set(res.access_token)
      tokenStore.setRefresh(res.refresh_token)
      if (res.user_id) tokenStore.setUserId(res.user_id)
      localStorage.setItem("user_email", email)

      onAuthenticated()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed"
      setError(msg.includes("duplicate") ? t("auth.err.emailRegistered") : t("auth.err.invalidCreds"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-10">
        {/* Brand */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight">LongRide</h1>
            <div className="flex rounded-md border bg-card p-1">
              {(["ru", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  className={cn(
                    "px-2 py-1 text-xs font-medium rounded",
                    lang === l ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setLang(l)}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === "login" && t("auth.signinSubtitle")}
            {mode === "register" && t("auth.registerSubtitle")}
            {mode === "forgot" && t("auth.forgotSubtitle")}
          </p>
        </div>

        {mode === "forgot" && forgotSent ? (
          <div className="space-y-6">
            <div className="rounded-lg border bg-secondary/40 px-4 py-5 text-sm leading-relaxed">
              {t("auth.resetSent", { email })}
            </div>
            <button
              type="button"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => { setMode("login"); setForgotSent(false) }}
            >
              {t("auth.backToLogin")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Input
                type="email"
                placeholder={t("auth.email")}
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {mode !== "forgot" && (
                <Input
                  type="password"
                  placeholder={t("auth.password")}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
              {mode === "register" && (
                <Input
                  type="password"
                  placeholder={t("auth.confirmPassword")}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                  onClick={() => setMode("forgot")}
                >
                  {t("auth.forgot")}
                </button>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? t("common.pleaseWait")
                : mode === "login"
                  ? t("auth.signinTitle")
                  : mode === "register"
                    ? t("auth.createAccount")
                    : t("auth.sendReset")}
            </Button>
          </form>
        )}

        {/* Mode toggle */}
        {!forgotSent && (
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                {t("auth.noAccount")}{" "}
                <button
                  type="button"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                  onClick={() => { setMode("register"); setError("") }}
                >
                  {t("auth.register")}
                </button>
              </>
            ) : (
              <>
                {t("auth.haveAccount")}{" "}
                <button
                  type="button"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                  onClick={() => { setMode("login"); setError("") }}
                >
                  {t("auth.login")}
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
