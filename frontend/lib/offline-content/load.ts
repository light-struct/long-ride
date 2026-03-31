import { OfflineCollectionSchema, type OfflineCollection } from "./schema"

export function loadOfflineCollection(data: unknown, sourceName: string): OfflineCollection {
  const parsed = OfflineCollectionSchema.safeParse(data)
  if (!parsed.success) {
    // Keep the app fail-fast in dev, but don't leak a giant schema dump to the UI.
    // eslint-disable-next-line no-console
    console.error(`Invalid offline JSON (${sourceName})`, parsed.error.flatten())
    throw new Error(`Invalid offline JSON: ${sourceName}`)
  }
  return parsed.data
}

