"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Income {
  id: string
  description: string
  amount: number
  isPaused: boolean
  date: string
}

interface AddIncomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddIncome: (income: Income) => void
}

export default function AddIncomeDialog({ open, onOpenChange, onAddIncome }: AddIncomeDialogProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [isPaused, setIsPaused] = useState(false)
  const [date, setDate] = useState(() => {
    const today = new Date()
    // Format as YYYY-MM-DD
    return today.toISOString().split("T")[0]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description) {
      alert("Please enter a description")
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      alert("Please enter a valid amount")
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
          <DialogTitle>Add Income</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="income-description">Description</Label>
            <Input
              id="income-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Salary, Freelance work"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-amount">Amount</Label>
            <Input
              id="income-amount"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="income-paused" checked={isPaused} onCheckedChange={setIsPaused} />
            <Label htmlFor="income-paused">Pause this income</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-date">Date</Label>
            <Input id="income-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <Button type="submit" className="w-full">
            Add Income
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
