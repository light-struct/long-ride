"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Wrench, MessageCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiAskAI } from "@/lib/api"

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
    content: "Hello! I'm your AI cycling mechanic assistant. Ask me anything about bicycle maintenance, repairs, or technical issues.",
  },
]

const suggestedQuestions = [
  "How do I adjust my brakes?",
  "When should I replace my chain?",
  "How to fix a squeaky bottom bracket?",
  "Tips for cleaning my drivetrain",
]

/* ─── Toolkit Data ───────────────────────────────────────────────────────────── */

interface RepairStep { step: number; instruction: string }
interface RepairGuide { issue: string; difficulty: "Easy" | "Medium" | "Hard"; steps: RepairStep[] }
interface Category { name: string; guides: RepairGuide[] }

const categories: Category[] = [
  {
    name: "Brakes",
    guides: [
      {
        issue: "Squeaking Brakes", difficulty: "Easy",
        steps: [
          { step: 1, instruction: "Clean brake pads with isopropyl alcohol and a clean rag." },
          { step: 2, instruction: "Check pad alignment - they should hit the rim evenly and not touch the tire." },
          { step: 3, instruction: "Toe-in the pads slightly: front of pad should contact rim first." },
          { step: 4, instruction: "If squeaking persists, lightly sand the pads with fine sandpaper to remove glazing." },
          { step: 5, instruction: "Clean the rim braking surface with degreaser." },
        ],
      },
      {
        issue: "Weak Braking Power", difficulty: "Medium",
        steps: [
          { step: 1, instruction: "Check brake pad wear - replace if worn past the indicator line." },
          { step: 2, instruction: "Inspect cables for fraying or rust. Replace if damaged." },
          { step: 3, instruction: "Adjust barrel adjuster to increase cable tension." },
          { step: 4, instruction: "Check caliper bolt tightness and alignment." },
          { step: 5, instruction: "Ensure brake lever is engaging fully and cable is properly seated." },
        ],
      },
    ],
  },
  {
    name: "Drivetrain",
    guides: [
      {
        issue: "Chain Skipping", difficulty: "Medium",
        steps: [
          { step: 1, instruction: "Check chain wear with a chain checker tool. Replace if stretched beyond 0.75%." },
          { step: 2, instruction: "Inspect cassette teeth for shark-fin wear pattern." },
          { step: 3, instruction: "Ensure chain is properly lubricated and clean." },
          { step: 4, instruction: "Check chain length - should have slight tension when on smallest cog." },
          { step: 5, instruction: "Verify rear derailleur hanger is straight (for geared bikes)." },
        ],
      },
      {
        issue: "Noisy Chain", difficulty: "Easy",
        steps: [
          { step: 1, instruction: "Clean chain thoroughly with degreaser and brush." },
          { step: 2, instruction: "Wipe chain completely dry with clean rag." },
          { step: 3, instruction: "Apply chain lubricant to each link while rotating pedals backward." },
          { step: 4, instruction: "Let lubricant penetrate for 5 minutes." },
          { step: 5, instruction: "Wipe off excess lubricant - chain should feel dry to touch." },
        ],
      },
      {
        issue: "Creaking Bottom Bracket", difficulty: "Hard",
        steps: [
          { step: 1, instruction: "Remove both crank arms using appropriate crank puller." },
          { step: 2, instruction: "Remove bottom bracket using correct tool for your BB type." },
          { step: 3, instruction: "Clean BB shell threads and apply fresh grease." },
          { step: 4, instruction: "Inspect bearings for wear or roughness. Replace if necessary." },
          { step: 5, instruction: "Reinstall BB to correct torque specs. Reinstall cranks with thread locker." },
        ],
      },
    ],
  },
  {
    name: "Wheels",
    guides: [
      {
        issue: "Flat Tire", difficulty: "Easy",
        steps: [
          { step: 1, instruction: "Remove wheel and deflate tire completely." },
          { step: 2, instruction: "Use tire levers to unseat tire bead from rim." },
          { step: 3, instruction: "Remove inner tube and locate puncture using water or by listening." },
          { step: 4, instruction: "Patch tube or install new tube. Slightly inflate to give shape." },
          { step: 5, instruction: "Carefully reseat tire bead, ensuring tube isn't pinched. Inflate to recommended PSI." },
        ],
      },
      {
        issue: "Wheel Out of True", difficulty: "Hard",
        steps: [
          { step: 1, instruction: "Mount wheel in truing stand or flip bike upside down." },
          { step: 2, instruction: "Spin wheel and identify where rim wobbles left or right." },
          { step: 3, instruction: "Tighten spokes on opposite side of wobble, loosen spokes on same side." },
          { step: 4, instruction: "Make quarter-turn adjustments only. Recheck after each adjustment." },
          { step: 5, instruction: "Check spoke tension is even. Stress-relieve spokes by squeezing pairs together." },
        ],
      },
    ],
  },
]

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "Easy":   return "bg-green-500/10 text-green-600 hover:bg-green-500/10"
    case "Medium": return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/10"
    case "Hard":   return "bg-red-500/10 text-red-600 hover:bg-red-500/10"
    default:       return ""
  }
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */

export function AIAssistant() {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

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
          content: `AI request failed: ${msg}`,
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
        <h1 className="text-2xl font-semibold tracking-tight">AI Mechanic</h1>
        <p className="text-sm text-muted-foreground">Chat or browse repair guides</p>
      </div>

      <Tabs defaultValue="chat" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="w-full shrink-0">
          <TabsTrigger value="chat" className="flex-1 gap-2">
            <MessageCircle className="size-4" />Chat
          </TabsTrigger>
          <TabsTrigger value="toolkit" className="flex-1 gap-2">
            <Wrench className="size-4" />Emergency Toolkit
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="mt-4 flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto pb-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}>
                <div className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  message.role === "assistant" ? "bg-secondary" : "bg-foreground text-background"
                )}>
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
              <p className="text-xs text-muted-foreground">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question) => (
                  <Button key={question} variant="outline" size="sm" className="h-auto py-1.5 text-xs"
                    onClick={() => setInput(question)}>
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 shrink-0">
            <Input
              placeholder="Ask a question..."
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
        </TabsContent>

        {/* Toolkit Tab */}
        <TabsContent value="toolkit" className="mt-4 flex-1 overflow-y-auto">
          <Accordion type="multiple" className="space-y-2">
            {categories.map((category) => (
              <AccordionItem key={category.name} value={category.name} className="rounded-lg border px-4 last:border-b">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{category.name}</span>
                    <span className="text-sm text-muted-foreground">({category.guides.length} guides)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.guides.map((guide) => (
                      <AccordionItem key={guide.issue} value={guide.issue} className="rounded-md border-0 bg-secondary/50">
                        <AccordionTrigger className="px-4 hover:no-underline">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{guide.issue}</span>
                            <Badge variant="secondary" className={getDifficultyColor(guide.difficulty)}>
                              {guide.difficulty}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <Card className="bg-background">
                            <ol className="space-y-3 p-4">
                              {guide.steps.map((step) => (
                                <li key={step.step} className="flex gap-3">
                                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                                    {step.step}
                                  </span>
                                  <p className="text-sm leading-relaxed">{step.instruction}</p>
                                </li>
                              ))}
                            </ol>
                          </Card>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Card className="mt-4 border-dashed">
            <div className="flex items-center gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Available Offline</p>
                <p className="text-xs text-muted-foreground">These guides are cached for emergency access without internet</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
