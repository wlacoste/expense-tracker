"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { getTranslations } from "@/lib/translations"

interface Income {
  id: string
  description: string
  amount: number
  isPaused: boolean
  date: string,
}

interface AddIncomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddIncome: (income: Income) => void
  language: string
}

export default function AddIncomeDialog({ open, onOpenChange, onAddIncome, language }: AddIncomeDialogProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [isPaused, setIsPaused] = useState(false)
    const t = getTranslations(language as any)
  
  const [date, setDate] = useState(() => {
    const today = new Date()

    // Format as YYYY-MM-DD
    return today.toISOString().split("T")[0]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description) {
      alert(t.incomeDialog.alerts.noDescription)
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      alert(t.incomeDialog.alerts.invalidAmount)
      return
    }

    const newIncome: Income = {
      id: "", // Will be set in the parent component
      description,
      amount: Number.parseFloat(amount),
      isPaused,
      date,
    }

    onAddIncome(newIncome)
    resetForm()
  }

  const resetForm = () => {
    setDescription("")
    setAmount("")
    setIsPaused(false)
    // Reset date to today
    const today = new Date()
    setDate(today.toISOString().split("T")[0])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
        <DialogTitle>{t.incomeDialog.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
          <Label htmlFor="income-description">{t.incomeDialog.description}</Label>
          <Input
              id="income-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.incomeDialog.descriptionPlaceholder}
              required
            />
          </div>

          <div className="space-y-2">
          <Label htmlFor="income-amount">{t.incomeDialog.amount}</Label>
            <Input
              id="income-amount"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t.incomeDialog.amountPlaceholder}
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="income-paused" checked={isPaused} onCheckedChange={setIsPaused} />
            <Label htmlFor="income-paused">{t.incomeDialog.paused}</Label>
          </div>

          <div className="space-y-2">
          <Label htmlFor="income-date">{t.incomeDialog.date}</Label>
            <Input id="income-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <Button type="submit" className="w-full">
          {t.incomeDialog.submit}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
