"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/components/i18n/language-provider"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bike,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Gauge,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  loadActiveBikeId,
  loadBikes,
  pushActivity,
  saveActiveBikeId,
  saveBikes,
  type BicycleData,
  type Category,
  type Component,
} from "@/lib/local-state"

/* ─── Types ─────────────────────────────────────────────────────────────── */
// Types and storage helpers are centralized in lib/local-state.ts

/* ─── Modals ─────────────────────────────────────────────────────────────── */

interface BikeFormDialogProps {
  open: boolean
  onClose: () => void
  initial?: { name: string; type: string }
  onSave: (name: string, type: string) => void
  title: string
}

function BikeFormDialog({ open, onClose, initial, onSave, title }: BikeFormDialogProps) {
  const { t } = useI18n()
  const [name, setName] = React.useState(initial?.name ?? "")
  const [type, setType] = React.useState(initial?.type ?? "")

  React.useEffect(() => {
    setName(initial?.name ?? "")
    setType(initial?.type ?? "")
  }, [initial, open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t("garage.dialog.bikeDetails")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label>{t("garage.field.name")}</Label>
            <Input placeholder={t("garage.placeholder.bikeName")} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("garage.field.type")}</Label>
            <Input placeholder={t("garage.placeholder.bikeType")} value={type} onChange={(e) => setType(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button onClick={() => { onSave(name, type); onClose() }} disabled={!name.trim()}>{t("common.save")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ComponentFormDialogProps {
  open: boolean
  onClose: () => void
  fixedCategory?: Category
  initial?: { name: string; category: Category; mileage: number }
  onSave: (name: string, category: Category, mileage: number) => void
  title: string
}

function ComponentFormDialog({ open, onClose, fixedCategory, initial, onSave, title }: ComponentFormDialogProps) {
  const { t } = useI18n()
  const [name, setName]         = React.useState(initial?.name ?? "")
  const [category, setCategory] = React.useState<Category>(fixedCategory ?? initial?.category ?? "Drivetrain")
  const [mileage, setMileage]   = React.useState(String(initial?.mileage ?? "0"))

  React.useEffect(() => {
    setName(initial?.name ?? "")
    setCategory(fixedCategory ?? initial?.category ?? "Drivetrain")
    setMileage(String(initial?.mileage ?? "0"))
  }, [fixedCategory, initial, open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t("garage.dialog.compDetails")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          {!fixedCategory && (
            <div className="space-y-1.5">
              <Label>{t("garage.field.category")}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Drivetrain">{t("category.Drivetrain")}</SelectItem>
                  <SelectItem value="Brakes">{t("category.Brakes")}</SelectItem>
                  <SelectItem value="Other">{t("category.Other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>{t("garage.field.componentName")}</Label>
            <Input placeholder={t("garage.placeholder.componentName")} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("garage.field.currentMileage")}</Label>
            <Input type="number" min="0" placeholder="0" value={mileage} onChange={(e) => setMileage(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button onClick={() => { onSave(name, category, Number(mileage)); onClose() }} disabled={!name.trim()}>{t("common.save")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface MileageDialogProps {
  open: boolean
  onClose: () => void
  onSave: (addKm: number) => void
}

function MileageDialog({ open, onClose, onSave }: MileageDialogProps) {
  const { t } = useI18n()
  const [value, setValue] = React.useState("")

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("garage.dialog.addMileage")}</DialogTitle>
          <DialogDescription>{t("garage.dialog.addMileageDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <Label>{t("garage.field.distance")}</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button
            onClick={() => {
              onSave(Number(value) || 0)
              onClose()
              setValue("")
            }}
            disabled={!value || Number(value) <= 0}
          >
            {t("common.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface DeleteDialogProps {
  open: boolean
  onClose: () => void
  label: string
  onConfirm: () => void
}

function DeleteDialog({ open, onClose, label, onConfirm }: DeleteDialogProps) {
  const { t } = useI18n()
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("garage.deleteConfirm.title", { label })}</AlertDialogTitle>
          <AlertDialogDescription>{t("garage.deleteConfirm.desc")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90"
            onClick={() => { onConfirm(); onClose() }}>
            {t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export function Garage() {
  const { t } = useI18n()
  const [bikes, setBikes] = React.useState<BicycleData[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    const loaded = loadBikes()
    setBikes(loaded)
    const active = loadActiveBikeId()
    if (active && loaded.some((b) => b.id === active)) {
      setSelectedId(active)
    }
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    saveBikes(bikes)
  }, [bikes, hydrated])

  // Bike CRUD dialogs
  const [addBikeOpen, setAddBikeOpen]   = React.useState(false)
  const [editBikeOpen, setEditBikeOpen] = React.useState(false)
  const [deleteBikeOpen, setDeleteBikeOpen] = React.useState(false)

  // Component CRUD dialogs
  const [addCompCategory, setAddCompCategory] = React.useState<Category | null>(null)
  const [editComp, setEditComp]         = React.useState<Component | null>(null)
  const [deleteComp, setDeleteComp]     = React.useState<Component | null>(null)
  const [mileageOpen, setMileageOpen]   = React.useState(false)

  const selectedBike = bikes.find((b) => b.id === selectedId) ?? null

  /* ── Bike operations ─────────────── */

  const handleAddBike = (name: string, type: string) => {
    const newBike: BicycleData = { id: crypto.randomUUID(), name, type, components: [] }
    setBikes((prev) => {
      const next = [...prev, newBike]
      saveBikes(next)
      return next
    })
    saveActiveBikeId(newBike.id)
    pushActivity(`New bike '${name}' added`)
  }

  const handleEditBike = (name: string, type: string) => {
    setBikes((prev) => {
      const next = prev.map((b) => b.id === selectedId ? { ...b, name, type } : b)
      saveBikes(next)
      return next
    })
    if (selectedBike) pushActivity(`Bike '${selectedBike.name}' updated`)
  }

  const handleDeleteBike = () => {
    setBikes((prev) => {
      const next = prev.filter((b) => b.id !== selectedId)
      saveBikes(next)
      return next
    })
    if (selectedBike) pushActivity(`Bike '${selectedBike.name}' deleted`)
    setSelectedId(null)
    saveActiveBikeId(null)
  }

  /* ── Component operations ────────── */

  const handleAddComponent = (name: string, category: Category, mileage: number) => {
    if (!selectedId) return
    const newComp: Component = { id: crypto.randomUUID(), name, category, mileage, detail: `${mileage} km` }
    setBikes((prev) => {
      const next = prev.map((b) => b.id === selectedId ? { ...b, components: [...b.components, newComp] } : b)
      saveBikes(next)
      return next
    })
    pushActivity(`Component '${name}' added`)
  }

  const handleEditComponent = (name: string, category: Category, mileage: number) => {
    if (!editComp || !selectedId) return
    setBikes((prev) => {
      const next = prev.map((b) => b.id === selectedId
        ? { ...b, components: b.components.map((c) => c.id === editComp.id ? { ...c, name, category, mileage, detail: `${mileage} km` } : c) }
        : b)
      saveBikes(next)
      return next
    })
    pushActivity(`Component '${name}' updated`)
    setEditComp(null)
  }

  const handleDeleteComponent = () => {
    if (!deleteComp || !selectedId) return
    setBikes((prev) => {
      const next = prev.map((b) => b.id === selectedId
        ? { ...b, components: b.components.filter((c) => c.id !== deleteComp.id) }
        : b)
      saveBikes(next)
      return next
    })
    pushActivity(`Component '${deleteComp.name}' deleted`)
    setDeleteComp(null)
  }

  const handleMileageUpdate = (addKm: number) => {
    if (!selectedId) return
    setBikes((prev) => {
      const next = prev.map((b) => b.id === selectedId
        ? { ...b, components: b.components.map((c) => ({ ...c, mileage: c.mileage + addKm, detail: `${c.mileage + addKm} km` })) }
        : b)
      saveBikes(next)
      return next
    })
    pushActivity(`Mileage +${addKm} km added`)
  }

  /* ── Group components by category ── */

  const categories: Category[] = ["Drivetrain", "Brakes", "Other"]

  /* ────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* ── List view ── */}
      {!selectedId ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{t("garage.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("garage.subtitle")}</p>
            </div>
            <Button size="sm" variant="outline" className="gap-2" onClick={() => setAddBikeOpen(true)}>
              <Plus className="size-4" />
              {t("garage.addBike")}
            </Button>
          </div>

          <div className="space-y-2.5">
            {bikes.map((bike) => {
              return (
                <Card
                  key={bike.id}
                  className="cursor-pointer transition-colors hover:bg-secondary/30"
                  onClick={() => {
                    setSelectedId(bike.id)
                    saveActiveBikeId(bike.id)
                  }}
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <Bike className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{bike.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {bike.type} · {t("garage.components", { count: bike.components.length })}
                      </p>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      ) : (
        /* ── Detail view ── */
        selectedBike && (
          <>
            {/* Back + header */}
            <div className="flex items-start gap-3">
              <Button variant="ghost" size="icon" className="-ml-2 mt-0.5 shrink-0" onClick={() => setSelectedId(null)}>
                <ArrowLeft className="size-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="truncate text-2xl font-semibold tracking-tight">{selectedBike.name}</h1>
                <p className="text-sm text-muted-foreground">{selectedBike.type}</p>
              </div>
            </div>

            {/* Bike-level actions */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="gap-2" onClick={() => setMileageOpen(true)}>
                <Gauge className="size-4" />
                {t("garage.updateMileage")}
              </Button>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => setEditBikeOpen(true)}>
                <Pencil className="size-4" />
                {t("garage.editBike")}
              </Button>
              <Button size="sm" variant="outline" className="gap-2 text-destructive hover:text-destructive" onClick={() => setDeleteBikeOpen(true)}>
                <Trash2 className="size-4" />
                {t("garage.deleteBike")}
              </Button>
            </div>

            {/* Component groups */}
            <Accordion type="multiple" className="space-y-2">
              {categories.map((cat) => {
                const comps = selectedBike.components.filter((c) => c.category === cat)
                const catLabel = t(`category.${cat}`)
                return (
                  <AccordionItem key={cat} value={cat} className="rounded-lg border px-4 last:border-b">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{catLabel}</span>
                        <span className="text-sm text-muted-foreground">({comps.length})</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pb-2">
                        {comps.map((comp) => (
                          <div key={comp.id} className="flex items-start gap-3 rounded-md bg-secondary/50 p-3">
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-medium">{comp.name}</p>
                              <p className="text-xs text-muted-foreground">{comp.detail}</p>
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <Button size="icon" variant="ghost" className="size-7"
                                onClick={() => setEditComp(comp)}>
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive"
                                onClick={() => setDeleteComp(comp)}>
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="mt-1 w-full gap-2"
                          onClick={() => setAddCompCategory(cat)}>
                          <Plus className="size-4" />
                          {t("garage.addComponent")}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </>
        )
      )}

      {/* ── Dialogs ── */}

      <BikeFormDialog
        open={addBikeOpen}
        onClose={() => setAddBikeOpen(false)}
        onSave={handleAddBike}
        title={t("garage.dialog.addBicycle")}
      />

      {selectedBike && (
        <BikeFormDialog
          open={editBikeOpen}
          onClose={() => setEditBikeOpen(false)}
          initial={{ name: selectedBike.name, type: selectedBike.type }}
          onSave={handleEditBike}
          title={t("garage.dialog.editBicycle")}
        />
      )}

      <DeleteDialog
        open={deleteBikeOpen}
        onClose={() => setDeleteBikeOpen(false)}
        label={selectedBike?.name ?? "bicycle"}
        onConfirm={handleDeleteBike}
      />

      <ComponentFormDialog
        open={addCompCategory !== null}
        onClose={() => setAddCompCategory(null)}
        fixedCategory={addCompCategory ?? undefined}
        onSave={handleAddComponent}
        title={t("garage.dialog.addComponent")}
      />

      {editComp && (
        <ComponentFormDialog
          open={!!editComp}
          onClose={() => setEditComp(null)}
          initial={{ name: editComp.name, category: editComp.category, mileage: editComp.mileage }}
          onSave={handleEditComponent}
          title={t("garage.dialog.editComponent")}
        />
      )}

      {deleteComp && (
        <DeleteDialog
          open={!!deleteComp}
          onClose={() => setDeleteComp(null)}
          label={deleteComp.name}
          onConfirm={handleDeleteComponent}
        />
      )}

      {selectedBike && (
        <MileageDialog
          open={mileageOpen}
          onClose={() => setMileageOpen(false)}
          onSave={handleMileageUpdate}
        />
      )}
    </div>
  )
}
