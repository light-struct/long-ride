"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiLogin, apiRegister, tokenStore } from "@/lib/api"

type AuthMode = "login" | "register" | "forgot"

interface AuthProps {
  onAuthenticated: () => void
}

export function Auth({ onAuthenticated }: AuthProps) {
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
      setError("Passwords do not match")
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
      setError(msg.includes("duplicate") ? "Email already registered" : "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-10">
        {/* Brand */}
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">LongRide</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login" && "Sign in to your account"}
            {mode === "register" && "Create your account"}
            {mode === "forgot" && "Reset your password"}
          </p>
        </div>

        {mode === "forgot" && forgotSent ? (
          <div className="space-y-6">
            <div className="rounded-lg border bg-secondary/40 px-4 py-5 text-sm leading-relaxed">
              A reset link has been sent to <span className="font-medium">{email}</span>. Check your inbox.
            </div>
            <button
              type="button"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => { setMode("login"); setForgotSent(false) }}
            >
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {mode !== "forgot" && (
                <Input
                  type="password"
                  placeholder="Password"
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
              {mode === "register" && (
                <Input
                  type="password"
                  placeholder="Confirm password"
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
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"}
            </Button>
          </form>
        )}

        {/* Mode toggle */}
        {!forgotSent && (
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                  onClick={() => { setMode("register"); setError("") }}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                  onClick={() => { setMode("login"); setError("") }}
                >
                  Login
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
