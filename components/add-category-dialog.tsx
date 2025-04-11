"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Category {
  id: string
  name: string
  budget: number
  color: string
}

interface AddCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCategory: (category: Category) => void
}

export default function AddCategoryDialog({ open, onOpenChange, onAddCategory }: AddCategoryDialogProps) {
  const [name, setName] = useState("")
  const [budget, setBudget] = useState("")
  const [color, setColor] = useState("#6366f1")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      alert("Please enter a category name")
      return
    }

    const newCategory: Category = {
      id: "", // Will be set in the parent component
      name,
      budget: budget ? Number.parseFloat(budget) : 0,
      color,
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
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Groceries, Rent, Entertainment"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-budget">Monthly Budget (optional)</Label>
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
            <Label htmlFor="category-color">Color</Label>
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
            Add Category
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
