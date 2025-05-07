"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getTodayDate } from "@/lib/utils"

interface Reserve {
  id: string
  name?: string
  amount: number
  creationDate: string
  dissolutionDate?: string
  interestRate?: number
}

interface AddReserveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddReserve: (reserve: Reserve) => void
}

export default function AddReserveDialog({ open, onOpenChange, onAddReserve }: AddReserveDialogProps) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [creationDate, setCreationDate] = useState(getTodayDate())
  const [dissolutionDate, setDissolutionDate] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || Number.parseFloat(amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    const newReserve: Reserve = {
      id: "", // Will be set in the parent component
      name: name || undefined,
      amount: Number.parseFloat(amount),
      creationDate,
      dissolutionDate: dissolutionDate || undefined,
      interestRate: interestRate ? Number.parseFloat(interestRate) : undefined,
    }

    onAddReserve(newReserve)
    resetForm()
  }

  const resetForm = () => {
    setName("")
    setAmount("")
    setInterestRate("")
    setCreationDate(getTodayDate())
    setDissolutionDate("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Reserve</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="reserve-name">Name (optional)</Label>
            <Input
              id="reserve-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Emergency Fund, Vacation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reserve-amount">Amount</Label>
            <Input
              id="reserve-amount"
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

          <div className="space-y-2">
            <Label htmlFor="reserve-interest">Interest Rate % (optional)</Label>
            <Input
              id="reserve-interest"
              type="number"
              inputMode="decimal"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="e.g., 2.5"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reserve-creation-date">Creation Date</Label>
            <Input
              id="reserve-creation-date"
              type="date"
              value={creationDate}
              onChange={(e) => setCreationDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reserve-dissolution-date">Dissolution Date (optional)</Label>
            <Input
              id="reserve-dissolution-date"
              type="date"
              value={dissolutionDate}
              onChange={(e) => setDissolutionDate(e.target.value)}
              min={creationDate}
            />
          </div>

          <Button type="submit" className="w-full">
            Add Reserve
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
