// Always call same-origin proxy to avoid CORS/origin issues when opening the app
// via non-localhost addresses (e.g. 172.22.x.x) or 0.0.0.0.
// next.config.mjs rewrites /api/* -> ${NEXT_PUBLIC_API_URL}/*
const API_BASE = "/api"

// ─── Token storage ────────────────────────────────────────────────────────────

export const tokenStore = {
  get: () => (typeof window !== "undefined" ? localStorage.getItem("access_token") : null),
  set: (token: string) => localStorage.setItem("access_token", token),
  getRefresh: () => (typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null),
  setRefresh: (token: string) => localStorage.setItem("refresh_token", token),
  clear: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_id")
  },
  getUserId: () => (typeof window !== "undefined" ? localStorage.getItem("user_id") : null),
  setUserId: (id: string) => localStorage.setItem("user_id", id),
}

// ─── Base fetch with auth ─────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  // Auto-refresh on 401
  if (res.status === 401) {
    const refreshToken = tokenStore.getRefresh()
    if (refreshToken) {
      const refreshed = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
      if (refreshed.ok) {
        const data = await refreshed.json()
        tokenStore.set(data.access_token)
        headers["Authorization"] = `Bearer ${data.access_token}`
        const retry = await fetch(`${API_BASE}${path}`, { ...options, headers })
        if (!retry.ok) throw new Error(await retry.text())
        return retry.json()
      }
    }
    tokenStore.clear()
    throw new Error("unauthorized")
  }

  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user_id?: string
}

export async function apiRegister(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

// ─── Sync ─────────────────────────────────────────────────────────────────────

export interface ApiBicycle {
  id: string
  user_id: string
  name: string
  type: string
  total_mileage: number
  is_active: boolean
  version: number
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface ApiComponent {
  id: string
  bike_id: string
  category: string
  sub_category: string | null
  name: string
  current_mileage: number
  max_resource_km: number
  status: "Green" | "Yellow" | "Red"
  updated_at: string
  deleted_at?: string | null
}

export interface SyncResponse {
  bicycles: ApiBicycle[]
  components: ApiComponent[]
  synced_at: string
}

export async function apiSync(
  deviceId: string,
  bicycles: ApiBicycle[],
  components: ApiComponent[],
  lastSyncAt?: string
): Promise<SyncResponse> {
  return apiFetch<SyncResponse>("/sync", {
    method: "POST",
    body: JSON.stringify({
      device_id: deviceId,
      bicycles,
      components,
      last_sync_at: lastSyncAt ?? null,
    }),
  })
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export async function apiAskAI(question: string): Promise<{ answer: string }> {
  return apiFetch<{ answer: string }>("/ai/consult", {
    method: "POST",
    body: JSON.stringify({ question }),
  })
}
