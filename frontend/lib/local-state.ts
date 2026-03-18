export type Category = "Drivetrain" | "Brakes" | "Other"

export interface Component {
  id: string
  name: string
  detail: string
  mileage: number
  category: Category
}

export interface BicycleData {
  id: string
  name: string
  type: string
  components: Component[]
}

export interface ActivityItem {
  id: string
  action: string
  at: number // epoch ms
}

function safeParseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function getUserNamespace(): string {
  if (typeof window === "undefined") return "anon"
  return (
    localStorage.getItem("user_id") ||
    localStorage.getItem("user_email") ||
    "anon"
  )
}

function key(ns: string, name: string): string {
  return `lr:${ns}:${name}`
}

export function loadBikes(ns = getUserNamespace()): BicycleData[] {
  if (typeof window === "undefined") return []
  return safeParseJSON<BicycleData[]>(localStorage.getItem(key(ns, "bikes")), [])
}

export function saveBikes(bikes: BicycleData[], ns = getUserNamespace()): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key(ns, "bikes"), JSON.stringify(bikes))
}

export function loadActiveBikeId(ns = getUserNamespace()): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(key(ns, "active_bike_id"))
}

export function saveActiveBikeId(id: string | null, ns = getUserNamespace()): void {
  if (typeof window === "undefined") return
  if (id) localStorage.setItem(key(ns, "active_bike_id"), id)
  else localStorage.removeItem(key(ns, "active_bike_id"))
}

export function loadActivity(ns = getUserNamespace()): ActivityItem[] {
  if (typeof window === "undefined") return []
  return safeParseJSON<ActivityItem[]>(localStorage.getItem(key(ns, "activity")), [])
}

export function pushActivity(action: string, ns = getUserNamespace()): ActivityItem[] {
  if (typeof window === "undefined") return []
  const current = loadActivity(ns)
  const next: ActivityItem[] = [
    { id: crypto.randomUUID(), action, at: Date.now() },
    ...current,
  ].slice(0, 20)
  localStorage.setItem(key(ns, "activity"), JSON.stringify(next))
  return next
}

export function clearUserData(ns = getUserNamespace()): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(key(ns, "bikes"))
  localStorage.removeItem(key(ns, "active_bike_id"))
  localStorage.removeItem(key(ns, "activity"))
}

export function formatRelativeTime(epochMs: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - epochMs) / 1000))
  if (diffSec < 60) return "just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hours ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay} days ago`
}
