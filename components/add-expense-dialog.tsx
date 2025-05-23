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
import { getTranslations } from "@/lib/translations"
import { StarIcon } from "lucide-react"

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
  budget?: number
  orderNumber: number
  isDisabled: boolean
}

interface CreditCard {
  id: string
  description: string
  closingDay: number
  dueDay: number
  goodThruDate: string
  isPaused: boolean
}

// Update the AddExpenseDialogProps interface to include the preselected category
interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddExpense: (expense: Expense | Expense[]) => void
  categories: Category[]
  creditCards: CreditCard[]
  preselectedCategoryId?: string
  language: string
  favoriteCreditCardId?: string
}

// Update the component to use the preselected category
export default function AddExpenseDialog({
  open,
  onOpenChange,
  onAddExpense,
  categories,
  creditCards,
  language,
  preselectedCategoryId,
  favoriteCreditCardId,
}: AddExpenseDialogProps) {
  // Update the categoryId state to use the preselected category if provided
  const [categoryId, setCategoryId] = useState(preselectedCategoryId || "")
  const t = getTranslations(language as any)

  // Add an effect to update the category when the preselected category changes
  useEffect(() => {
    if (preselectedCategoryId) {
      setCategoryId(preselectedCategoryId)
    }
  }, [preselectedCategoryId])

  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
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

  // Update the handleSubmit function to ensure a category is always selected
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || Number.parseFloat(amount) <= 0) {
      alert(t.creditCardDialog.alerts.invalidAmount)
      return
    }

    const totalAmount = Number.parseFloat(amount)
    const installmentCount =
      installments === "other" ? Number.parseInt(customInstallments, 10) : Number.parseInt(installments, 10)

    if (
      installments === "other" &&
      (isNaN(Number.parseInt(customInstallments, 10)) || Number.parseInt(customInstallments, 10) < 2)
    ) {
      alert(t.creditCardDialog.alerts.invalidInstallments)
      return
    }

    // If no credit card or installments = 1, create a single expense
    if (!creditCardId || installmentCount === 1) {
      const newExpense: Expense = {
        id: "", // Will be set in the parent component
        description,
        amount: totalAmount,
        categoryId: categoryId || "", // Allow empty categoryId, will be handled in parent
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
        alert(t.creditCardDialog.alerts.creditCardNotFound)
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
          categoryId: categoryId || "", // Allow empty categoryId, will be handled in parent
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

  // Sort credit cards to show favorite first
  const sortedCreditCards = [...activeCreditCards].sort((a, b) => {
    if (a.id === favoriteCreditCardId) return -1
    if (b.id === favoriteCreditCardId) return 1
    return a.description.localeCompare(b.description)
  })

  // Filter out disabled categories and sort by orderNumber
  const activeCategories = categories
    .filter((category) => !category.isDisabled)
    .sort((a, b) => a.orderNumber - b.orderNumber)

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
          <DialogTitle>{t.creditCardDialog.addExpenseTitle}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="amount">{t.creditCardDialog.amountLabel}</Label>
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
            <Label htmlFor="description">{t.creditCardDialog.descriptionLabel}</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.creditCardDialog.categoryInputPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t.creditCardDialog.categoryLabel}</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder={t.creditCardDialog.selectCategoryPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {activeCategories
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
                {categories.find((category) => category.name === "Others" && !category.isDisabled) && (
                  <SelectItem
                    key={categories.find((category) => category.name === "Others" && !category.isDisabled)!.id}
                    value={categories.find((category) => category.name === "Others" && !category.isDisabled)!.id}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: categories.find(
                            (category) => category.name === "Others" && !category.isDisabled,
                          )!.color,
                        }}
                      />
                      Others
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-card">{t.creditCardDialog.creditCardLabel}</Label>
            <div className="flex gap-2 items-center">
              <div className="flex-1 relative">
                <Select value={creditCardId} onValueChange={setCreditCardId} disabled={sortedCreditCards.length === 0}>
                  <SelectTrigger id="credit-card">
                    <SelectValue
                      placeholder={
                        sortedCreditCards.length === 0
                          ? t.creditCardDialog.noCreditCardsOption
                          : t.creditCardDialog.creditCardPlaceholder
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedCreditCards.length > 0 ? (
                      sortedCreditCards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          <div className="flex items-center">
                            {card.id === favoriteCreditCardId && (
                              <StarIcon className="h-3 w-3 mr-1 text-yellow-500" fill="currentColor" />
                            )}
                            {card.description}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-cards-available" disabled>
                        {t.creditCardDialog.noCreditCardsOption}
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
                  <span className="sr-only">{t.creditCardDialog.clearSelectionSr}</span>
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
                <Label htmlFor="installments">{t.creditCardDialog.installmentsLabel}</Label>
                <Select value={installments} onValueChange={setInstallments}>
                  <SelectTrigger id="installments">
                    <SelectValue placeholder={t.creditCardDialog.installmentsPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{t.creditCardDialog.singlePayment}</SelectItem>
                    {[3, 6, 9, 12, 18, 24].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {t.creditCardDialog.installmentsOption(n)}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">{t.creditCardDialog.otherInstallmentsOption}</SelectItem>
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
                      placeholder={t.creditCardDialog.customInstallmentsPlaceholder}
                    />
                  </div>
                )}

                {installments !== "1" && amount && (
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="text-sm">
                      <span className="font-medium">Total:</span> {formatCurrency(Number.parseFloat(amount))}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">{t.creditCardDialog.perInstallment}</span>
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
                  {t.creditCardDialog.executionNotice}
                  <span className="font-medium">{executionDate ? formatDate(executionDate) : ""}</span>
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="space-y-2">
            <Label htmlFor="date">{t.creditCardDialog.dateLabel}</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="recurring-expense" checked={isRecurring} onCheckedChange={setIsRecurring} />
            <Label htmlFor="recurring-expense">{t.creditCardDialog.recurringExpenseLabel}</Label>
          </div>
          {isRecurring && (
            <p className="text-xs text-muted-foreground">
              {installments !== "1" ? t.creditCardDialog.recurringNoteMultiple : t.creditCardDialog.recurringNoteSingle}
            </p>
          )}

          <Button type="submit" className="w-full">
            {t.creditCardDialog.addExpenseButton}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
