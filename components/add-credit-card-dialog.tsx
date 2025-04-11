"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreditCard {
  id: string
  description: string
  closingDay: number
  dueDay: number
  goodThruDate: string
  isPaused: boolean
}

interface AddCreditCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCreditCard: (creditCard: CreditCard) => void
}

export default function AddCreditCardDialog({ open, onOpenChange, onAddCreditCard }: AddCreditCardDialogProps) {
  const [description, setDescription] = useState("")
  const [closingDay, setClosingDay] = useState("")
  const [dueDay, setDueDay] = useState("")
  const [goodThruMonth, setGoodThruMonth] = useState("")
  const [goodThruYear, setGoodThruYear] = useState("")
  const [isPaused, setIsPaused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description) {
      alert("Please enter a description")
      return
    }

    const closingDayNum = Number.parseInt(closingDay, 10)
    const dueDayNum = Number.parseInt(dueDay, 10)

    if (isNaN(closingDayNum) || closingDayNum < 1 || closingDayNum > 30) {
      alert("Please enter a valid closing day (1-30)")
      return
    }

    if (isNaN(dueDayNum) || dueDayNum < 1 || dueDayNum > 30) {
      alert("Please enter a valid due day (1-30)")
      return
    }

    if (!goodThruMonth || !goodThruYear) {
      alert("Please select both month and year for Good Thru date")
      return
    }

    // Calculate the last day of the selected month
    const month = Number.parseInt(goodThruMonth, 10)
    const year = Number.parseInt(goodThruYear, 10)
    // Get the last day of the month by getting the 0th day of the next month and subtracting 1
    const lastDay = new Date(year, month, 0).getDate()
    const goodThruDate = `${year}-${month.toString().padStart(2, "0")}-${lastDay.toString().padStart(2, "0")}`

    const newCreditCard: CreditCard = {
      id: "", // Will be set in the parent component
      description,
      closingDay: closingDayNum,
      dueDay: dueDayNum,
      goodThruDate,
      isPaused,
    }

    onAddCreditCard(newCreditCard)
    resetForm()
  }

  const resetForm = () => {
    setDescription("")
    setClosingDay("")
    setDueDay("")
    setGoodThruMonth("")
    setGoodThruYear("")
    setIsPaused(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Credit Card</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="credit-card-description">Description</Label>
            <Input
              id="credit-card-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Visa, Mastercard"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-card-closing-day">Closing Day (1-30)</Label>
            <Input
              id="credit-card-closing-day"
              type="number"
              inputMode="numeric"
              value={closingDay}
              onChange={(e) => setClosingDay(e.target.value)}
              placeholder="15"
              min="1"
              max="30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-card-due-day">Due Day (1-30)</Label>
            <Input
              id="credit-card-due-day"
              type="number"
              inputMode="numeric"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              placeholder="5"
              min="1"
              max="30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-card-good-thru">Good Thru (Month/Year)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select value={goodThruMonth} onValueChange={setGoodThruMonth} required>
                <SelectTrigger id="credit-card-good-thru-month">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">January</SelectItem>
                  <SelectItem value="2">February</SelectItem>
                  <SelectItem value="3">March</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">May</SelectItem>
                  <SelectItem value="6">June</SelectItem>
                  <SelectItem value="7">July</SelectItem>
                  <SelectItem value="8">August</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                </SelectContent>
              </Select>

              <Select value={goodThruYear} onValueChange={setGoodThruYear} required>
                <SelectTrigger id="credit-card-good-thru-year">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i} value={(new Date().getFullYear() + i).toString()}>
                      {new Date().getFullYear() + i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="credit-card-paused" checked={isPaused} onCheckedChange={setIsPaused} />
            <Label htmlFor="credit-card-paused">Pause this credit card</Label>
          </div>

          <Button type="submit" className="w-full">
            Add Credit Card
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
