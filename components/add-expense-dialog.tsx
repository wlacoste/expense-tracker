"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { calculateExecutionDate, getFormattedDate, getTodayDate, formatDate } from "@/lib/utils"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

interface Expense {
  id: string
  description: string
  amount: number
  categoryId: string
  date: string
  creditCardId?: string
  executionDate?: string
  expenseInstallmentId?: string
  installmentQuantity?: number
  installmentNumber?: number
  totalAmount?: number
  isPaid?: boolean
  isRecurring?: boolean
}

interface Installment {
  id: string
  amount: number
  executionDate: string
  isPaid: boolean
}

interface Category {
  id: string
  name: string
  color: string
}

interface CreditCard {
  id: string
  description: string
  closingDay: number
  dueDay: number
  goodThruDate: string
  isPaused: boolean
}

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddExpense: (expense: Expense | Expense[]) => void
  categories: Category[]
  creditCards: CreditCard[]
}

export default function AddExpenseDialog({
  open,
  onOpenChange,
  onAddExpense,
  categories,
  creditCards,
}: AddExpenseDialogProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [creditCardId, setCreditCardId] = useState("")
  const [executionDate, setExecutionDate] = useState<string | undefined>(undefined)
  const [date, setDate] = useState(() => getTodayDate())
  const [installments, setInstallments] = useState<string>("1")
  const [customInstallments, setCustomInstallments] = useState<string>("2")
  const [isRecurring, setIsRecurring] = useState(false)

  // Calculate execution date when credit card or date changes
  useEffect(() => {
    if (creditCardId) {
      const selectedCard = creditCards.find((card) => card.id === creditCardId)
      if (selectedCard) {
        const execDate = calculateExecutionDate(date, selectedCard.closingDay, selectedCard.dueDay)
        setExecutionDate(getFormattedDate(execDate))
      }
    } else {
      setExecutionDate(undefined)
    }
  }, [creditCardId, date, creditCards])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || Number.parseFloat(amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    const totalAmount = Number.parseFloat(amount)
    const installmentCount =
      installments === "other" ? Number.parseInt(customInstallments, 10) : Number.parseInt(installments, 10)

    if (
      installments === "other" &&
      (isNaN(Number.parseInt(customInstallments, 10)) || Number.parseInt(customInstallments, 10) < 2)
    ) {
      alert("Please enter a valid number of installments (minimum 2)")
      return
    }

    // If no credit card or installments = 1, create a single expense
    if (!creditCardId || installmentCount === 1) {
      const newExpense: Expense = {
        id: "", // Will be set in the parent component
        description,
        amount: totalAmount,
        categoryId,
        date,
        creditCardId: creditCardId || undefined,
        executionDate: executionDate,
        isRecurring: isRecurring,
      }
      onAddExpense(newExpense)
    } else {
      // Create multiple expenses for installments
      const expenseInstallmentId = Date.now().toString()
      const installmentAmount = Number.parseFloat((totalAmount / installmentCount).toFixed(2))

      // Calculate if we need to adjust the first installment to account for rounding
      const roundingDifference = totalAmount - installmentAmount * installmentCount

      const expenses: Expense[] = []
      const selectedCard = creditCards.find((card) => card.id === creditCardId)

      if (!selectedCard) {
        alert("Selected credit card not found")
        return
      }

      // Create an expense for each installment
      for (let i = 0; i < installmentCount; i++) {
        // For the first installment, add any rounding difference
        const currentAmount =
          i === 0 ? Number.parseFloat((installmentAmount + roundingDifference).toFixed(2)) : installmentAmount

        // Calculate the date for this installment
        let installmentDate: string
        let installmentExecutionDate: string

        if (i === 0) {
          // First installment uses the selected date
          installmentDate = date
          installmentExecutionDate = executionDate || date
        } else {
          const execDateNew = new Date(installmentExecutionDate)

          // For subsequent installments:
          // 1. Calculate the month for this installment

          const [yearE, monthE, dayE] = executionDate.split("-").map(Number)
          const tempDate = new Date(yearE, monthE - 1 + i, 1)
          const daysInMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate()
          const clampedDay = Math.min(dayE, daysInMonth)
          const finalDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), clampedDay)
          finalDate.setHours(0, 0, 0, 0)
          installmentExecutionDate = getFormattedDate(finalDate)

          const dateObj = new Date(date)
          dateObj.setMonth(dateObj.getMonth() + i)
          const year = dateObj.getFullYear()
          const month = dateObj.getMonth()

          // 2. Create a date using the credit card's due day for that month
          // Make sure the due day is valid for that month
          const lastDayOfMonth = new Date(year, month + 1, 0).getDate()

          const dueDayForMonth = Math.min(selectedCard.dueDay, lastDayOfMonth)

          // 3. Set the installment date to the due date of the credit card for that month
          const dueDate = new Date(year, month, dueDayForMonth)
          installmentDate = getFormattedDate(dueDate)

          // 4. Calculate the execution date based on the installment date
          const execDate = calculateExecutionDate(installmentDate, selectedCard.closingDay, selectedCard.dueDay)
          // installmentExecutionDate = getFormattedDate(execDate)
          console.log("installmentExecutionDate", installmentExecutionDate)
        }

        expenses.push({
          id: "", // Will be set in the parent component
          description: `${description} (${i + 1}/${installmentCount})`,
          amount: currentAmount,
          categoryId,
          date: installmentDate,
          creditCardId,
          executionDate: installmentExecutionDate,
          expenseInstallmentId,
          installmentQuantity: installmentCount,
          installmentNumber: i + 1,
          totalAmount,
          isPaid: false,
          isRecurring: isRecurring,
        })
      }

      onAddExpense(expenses)
    }

    resetForm()
  }

  const resetForm = () => {
    setDescription("")
    setAmount("")
    setCategoryId("")
    setCreditCardId("")
    setExecutionDate(undefined)
    setInstallments("1")
    setCustomInstallments("2")
    setIsRecurring(false)
    // Reset date to today
    setDate(getTodayDate())
  }

  // Filter out paused credit cards
  const activeCreditCards = creditCards.filter((card) => !card.isPaused)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
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
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Grocery shopping"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((category) => category.name !== "Others")
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}

                {/* Add Others category at the end */}
                {categories.find((category) => category.name === "Others") && (
                  <SelectItem
                    key={categories.find((category) => category.name === "Others")!.id}
                    value={categories.find((category) => category.name === "Others")!.id}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: categories.find((category) => category.name === "Others")!.color }}
                      />
                      Others
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-card">Credit Card (optional)</Label>
            <div className="flex gap-2 items-center">
              <div className="flex-1 relative">
                <Select value={creditCardId} onValueChange={setCreditCardId} disabled={activeCreditCards.length === 0}>
                  <SelectTrigger id="credit-card">
                    <SelectValue
                      placeholder={activeCreditCards.length === 0 ? "No credit cards available" : "Select credit card"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCreditCards.length > 0 ? (
                      activeCreditCards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.description}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-cards-available" disabled>
                        No credit cards available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {creditCardId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setCreditCardId("")}
                >
                  <span className="sr-only">Clear selection</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </Button>
              )}
            </div>
          </div>

          <Collapsible open={!!creditCardId} className="w-full">
            <CollapsibleContent className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="installments">Installments</Label>
                <Select value={installments} onValueChange={setInstallments}>
                  <SelectTrigger id="installments">
                    <SelectValue placeholder="Select number of installments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 (single payment)</SelectItem>
                    <SelectItem value="3">3 installments</SelectItem>
                    <SelectItem value="6">6 installments</SelectItem>
                    <SelectItem value="9">9 installments</SelectItem>
                    <SelectItem value="12">12 installments</SelectItem>
                    <SelectItem value="18">18 installments</SelectItem>
                    <SelectItem value="24">24 installments</SelectItem>
                    <SelectItem value="other">Other...</SelectItem>
                  </SelectContent>
                </Select>

                {installments === "other" && (
                  <div className="pt-2">
                    <Input
                      type="number"
                      min="2"
                      step="1"
                      value={customInstallments}
                      onChange={(e) => setCustomInstallments(e.target.value)}
                      placeholder="Number of installments"
                    />
                  </div>
                )}

                {installments !== "1" && amount && (
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="text-sm">
                      <span className="font-medium">Total:</span> {formatCurrency(Number.parseFloat(amount))}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Per installment:</span>{" "}
                      {formatCurrency(
                        Number.parseFloat(amount) /
                          (installments === "other"
                            ? Number.parseInt(customInstallments, 10)
                            : Number.parseInt(installments, 10)),
                      )}
                    </p>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={!!creditCardId && !!executionDate} className="w-full">
            <CollapsibleContent>
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  This expense will be executed on{" "}
                  <span className="font-medium">{executionDate ? formatDate(executionDate) : ""}</span>
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="recurring-expense" checked={isRecurring} onCheckedChange={setIsRecurring} />
            <Label htmlFor="recurring-expense">Recurring monthly expense</Label>
          </div>
          {isRecurring && (
            <p className="text-xs text-muted-foreground">
              {installments !== "1"
                ? "This installment plan will be automatically copied to future months when a new month starts."
                : "This expense will be automatically copied to future months."}
            </p>
          )}

          <Button type="submit" className="w-full">
            Add Expense
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
