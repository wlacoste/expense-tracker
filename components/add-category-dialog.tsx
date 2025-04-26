"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getTranslations } from "@/lib/translations"

interface Category {
  id: string
  name: string
  budget: number
  color: string
  orderNumber: number
  isDisabled: boolean
}

interface AddCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCategory: (category: Category) => void
  enabledCategoriesCount: number
  language: string
}

export default function AddCategoryDialog({
  open,
  onOpenChange,
  onAddCategory,
  enabledCategoriesCount,
  language
}: AddCategoryDialogProps) {
  const [name, setName] = useState("")
  const [budget, setBudget] = useState("")
  const [color, setColor] = useState("#6366f1")
  const t = getTranslations(language as any)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      alert(t.dialog.pleaseEnterCategoryName)
      return
    }

    const newCategory: Category = {
      id: "", // Will be set in the parent component
      name,
      budget: budget ? Number.parseFloat(budget) : 0,
      color,
      orderNumber: enabledCategoriesCount, // Set order number to count of enabled categories
      isDisabled: false, // Categories are enabled by default
    }

    onAddCategory(newCategory)
    resetForm()
  }

  const resetForm = () => {
    setName("")
    setBudget("")
    setColor("#6366f1")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.dialog.addCategoryTitle}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
          <Label htmlFor="category-name">{t.dialog.categoryNameLabel}</Label>
          <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.dialog.categoryNamePlaceholder}
              required
            />
          </div>

          <div className="space-y-2">
          <Label htmlFor="category-budget">{t.dialog.categoryBudgetLabel}</Label>
          <Input
              id="category-budget"
              type="number"
              inputMode="decimal"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
          <Label htmlFor="category-color">{t.dialog.categoryColorLabel}</Label>
          <div className="flex items-center gap-2">
              <Input
                id="category-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: color }} />
            </div>
          </div>

          <Button type="submit" className="w-full">
            {t.dialog.addCategoryButton}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
