import type { ApiBicycle, ApiComponent } from "@/lib/api"
import type { BicycleData, Component } from "@/lib/local-state"

const ZERO_UUID = "00000000-0000-0000-0000-000000000000"

function bikeDistanceKm(bike: BicycleData): number {
  if (!bike.components.length) return 0
  return bike.components.reduce((max, c) => Math.max(max, c.mileage), 0)
}

export function localToApi(
  bikes: BicycleData[],
  activeBikeId: string | null,
  nowIso = new Date().toISOString()
): { bicycles: ApiBicycle[]; components: ApiComponent[] } {
  const bicycles: ApiBicycle[] = bikes.map((b) => ({
    id: b.id,
    user_id: ZERO_UUID, // overwritten server-side from JWT
    name: b.name,
    type: b.type,
    total_mileage: bikeDistanceKm(b),
    is_active: activeBikeId ? b.id === activeBikeId : false,
    version: 1,
    created_at: nowIso,
    updated_at: nowIso,
    deleted_at: null,
  }))

  const components: ApiComponent[] = bikes.flatMap((b) =>
    b.components.map((c) => ({
      id: c.id,
      bike_id: b.id,
      category: c.category,
      // sub_category is optional in DB (nullable). Keep it null when we don't have a meaningful value.
      sub_category: null,
      name: c.name,
      current_mileage: c.mileage,
      max_resource_km: 1000,
      status: "Green",
      updated_at: nowIso,
      deleted_at: null,
    }))
  )

  return { bicycles, components }
}

export function apiToLocal(bicycles: ApiBicycle[], components: ApiComponent[]): BicycleData[] {
  const compsByBike = new Map<string, Component[]>()
  for (const c of components) {
    const comp: Component = {
      id: c.id,
      name: c.name,
      category: c.category as Component["category"],
      mileage: c.current_mileage,
      detail: `${Math.round(c.current_mileage)} km`,
    }
    const list = compsByBike.get(c.bike_id) || []
    list.push(comp)
    compsByBike.set(c.bike_id, list)
  }

  return bicycles
    .filter((b) => !b.deleted_at)
    .map((b) => ({
      id: b.id,
      name: b.name,
      type: b.type,
      components: compsByBike.get(b.id) || [],
    }))
}
