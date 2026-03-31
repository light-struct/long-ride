"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiAskAI } from "@/lib/api"
import { useI18n } from "@/components/i18n/language-provider"

/* ─── Types ──────────────────────────────────────────────────────────────────── */

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "",
  },
]

/* ─── Main Component ─────────────────────────────────────────────────────────── */

export function AIAssistant() {
  const { t } = useI18n()
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => (m.id === "1" && m.role === "assistant" ? { ...m, content: t("ai.greeting") } : m))
    )
  }, [t])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const question = input.trim()
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: question }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await apiAskAI(question)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.answer,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t("ai.requestFailed", { msg }),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:h-[calc(100vh-6rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">{t("ai.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("ai.subtitle")}</p>
      </div>

      <div className="mt-4 flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}>
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  message.role === "assistant"
                    ? "bg-secondary"
                    : "bg-foreground text-background"
                )}
              >
                {message.role === "assistant" ? <Bot className="size-4" /> : <User className="size-4" />}
              </div>
              <Card className={cn("max-w-[80%]", message.role === "user" && "bg-foreground text-background")}>
                <CardContent className="px-4 py-3">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </CardContent>
              </Card>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                <Bot className="size-4" />
              </div>
              <Card className="max-w-[80%]">
                <CardContent className="px-4 py-3">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 2 && (
          <div className="mb-4 space-y-2 shrink-0">
            <p className="text-xs text-muted-foreground">{t("ai.suggested")}</p>
            <div className="flex flex-wrap gap-2">
              {[t("ai.q1"), t("ai.q2"), t("ai.q3"), t("ai.q4")].map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  className="h-auto py-1.5 text-xs"
                  onClick={() => setInput(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 shrink-0">
          <Input
            placeholder={t("ai.placeholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1"
            disabled={loading}
          />
          <Button onClick={handleSend} size="icon" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
