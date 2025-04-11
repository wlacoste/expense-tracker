"use client"

import { SelectItem } from "@/components/ui/select"

import { SelectContent } from "@/components/ui/select"

import { SelectValue } from "@/components/ui/select"

import { SelectTrigger } from "@/components/ui/select"

import { Select } from "@/components/ui/select"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  formatCurrency,
  formatDate,
  getMonthlyExpenses,
  getMonthlyIncomes,
  calculateExecutionDate,
  getFormattedDate,
  generateMonthOptions,
} from "@/lib/utils"
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
import { Edit2Icon, Trash2Icon, PlusCircle, CreditCardIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { ScrollableSelect } from "./scrollable-select"

// Define the types
interface Expense {
  id: string
  amount: number
  description: string
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

interface Income {
  id: string
  amount: number
  description: string
  date: string
  isPaused: boolean
}

interface Category {
  id: string
  name: string
  color: string
  budget?: number
}

interface CreditCard {
  id: string
  description: string
  closingDay: number
  dueDay: number
  goodThruDate: string
  isPaused: boolean
}

interface TransactionsProps {
  expenses: Expense[]
  incomes: Income[]
  categories: Category[]
  creditCards: CreditCard[]
  selectedMonth: string
  onAddCategory: () => void
  onAddCreditCard: () => void
  setSelectedMonth: (month: string) => void
  onUpdateExpense: (expense: Expense) => void
  onDeleteExpense: (id: string) => void
  onDeleteMultipleExpenses?: (ids: string[]) => void // Add this line
  onUpdateIncome: (income: Income) => void
  onDeleteIncome: (id: string) => void
  onUpdateCategory: (category: Category) => void
  onDeleteCategory: (id: string) => void
  onUpdateCreditCard: (creditCard: CreditCard) => void
  onDeleteCreditCard: (id: string) => void
}

const formatGoodThruDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

export default function Transactions({
  expenses,
  incomes,
  categories,
  creditCards,
  selectedMonth,
  setSelectedMonth,
  onUpdateExpense,
  onDeleteExpense,
  onAddCategory,
  onAddCreditCard,
  onUpdateIncome,
  onDeleteIncome,
  onUpdateCategory,
  onDeleteCategory,
  onUpdateCreditCard,
  onDeleteCreditCard,
  onDeleteMultipleExpenses,
}: TransactionsProps) {
  // Edit states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [editingCreditCard, setEditingCreditCard] = useState<CreditCard | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [creditCardDialogOpen, setCreditCardDialogOpen] = useState(false)
  const [editingGoodThruMonth, setEditingGoodThruMonth] = useState("")
  const [editingGoodThruYear, setEditingGoodThruYear] = useState("")

  // Delete states
  const [deleteExpenseDialogOpen, setDeleteExpenseDialogOpen] = useState(false)
  const [deleteIncomeDialogOpen, setDeleteIncomeDialogOpen] = useState(false)
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false)
  const [deleteCreditCardDialogOpen, setDeleteCreditCardDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [creditCardToDelete, setCreditCardToDelete] = useState<CreditCard | null>(null)

  // New state for delete all installments dialog
  const [deleteAllInstallmentsDialogOpen, setDeleteAllInstallmentsDialogOpen] = useState(false)
  const [deleteAllInstallments, setDeleteAllInstallments] = useState(false)

  // Generate month options
  const { pastOptions, currentOption, futureOptions, currentYearMonth } = useMemo(
    () => generateMonthOptions(expenses, incomes),
    [expenses, incomes],
  )

  // Combine all options for the ScrollableSelect
  const allOptions = useMemo(() => {
    return [...pastOptions, currentOption, ...futureOptions]
  }, [pastOptions, currentOption, futureOptions])

  // Edit handlers
  const handleEditIncome = (income: Income) => {
    setEditingIncome({ ...income })
    setIncomeDialogOpen(true)
  }

  const handleSaveIncomeEdit = () => {
    if (editingIncome) {
      onUpdateIncome(editingIncome)
      setIncomeDialogOpen(false)
      setEditingIncome(null)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory({ ...category })
    setCategoryDialogOpen(true)
  }

  const handleSaveCategoryEdit = () => {
    if (editingCategory) {
      onUpdateCategory(editingCategory)
      setCategoryDialogOpen(false)
      setEditingCategory(null)
    }
  }

  const handleEditCreditCard = (creditCard: CreditCard) => {
    setEditingCreditCard({ ...creditCard })

    // Parse the goodThruDate to get month and year
    if (creditCard.goodThruDate) {
      const [year, month] = creditCard.goodThruDate.split("-")
      setEditingGoodThruMonth(Number.parseInt(month, 10).toString())
      setEditingGoodThruYear(year)
    }

    setCreditCardDialogOpen(true)
  }

  const handleSaveCreditCardEdit = () => {
    if (editingCreditCard && editingGoodThruMonth && editingGoodThruYear) {
      // Calculate the last day of the selected month
      const month = Number.parseInt(editingGoodThruMonth, 10)
      const year = Number.parseInt(editingGoodThruYear, 10)
      // Get the last day of the month by getting the 0th day of the next month and subtracting 1
      const lastDay = new Date(year, month, 0).getDate()
      const goodThruDate = `${year}-${month.toString().padStart(2, "0")}-${lastDay.toString().padStart(2, "0")}`

      onUpdateCreditCard({
        ...editingCreditCard,
        goodThruDate,
      })

      setCreditCardDialogOpen(false)
      setEditingCreditCard(null)
    }
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense({ ...expense })
    setEditDialogOpen(true)
  }

  // Update the handleSaveEdit function to update all installments when category changes
  const handleSaveEdit = () => {
    if (editingExpense) {
      // Store the original category ID to check if it changed
      const originalCategoryId = expenses.find((e) => e.id === editingExpense.id)?.categoryId

      // Check if we need to use the "Others" category
      if (!editingExpense.categoryId) {
        const othersCategory = categories.find((cat) => cat.name === "Others")
        if (othersCategory) {
          editingExpense.categoryId = othersCategory.id
        }
      }

      // Recalculate execution date if credit card is selected
      if (editingExpense.creditCardId) {
        const selectedCard = creditCards.find((card) => card.id === editingExpense.creditCardId)
        if (selectedCard) {
          // Make sure we're passing a string date to calculateExecutionDate
          const execDate = calculateExecutionDate(editingExpense.date, selectedCard.closingDay, selectedCard.dueDay)
          editingExpense.executionDate = getFormattedDate(execDate)
        }
      } else {
        editingExpense.executionDate = undefined
      }

      // Update the current expense
      onUpdateExpense(editingExpense)

      // If this is an installment and the category has changed, update all related installments
      if (editingExpense.expenseInstallmentId && originalCategoryId !== editingExpense.categoryId) {
        // Find all expenses with the same installment ID
        const relatedInstallments = expenses.filter(
          (e) => e.expenseInstallmentId === editingExpense.expenseInstallmentId && e.id !== editingExpense.id,
        )

        // Update the category for all related installments
        relatedInstallments.forEach((installment) => {
          onUpdateExpense({
            ...installment,
            categoryId: editingExpense.categoryId,
          })
        })
      }

      setEditDialogOpen(false)
      setEditingExpense(null)
    }
  }

  // Delete handlers
  const handleDeleteExpense = (expense: Expense) => {
    setExpenseToDelete(expense)
    setDeleteAllInstallments(false) // Reset the flag when starting a new delete operation

    // If this is an installment, ask if all installments should be deleted
    if (
      expense.expenseInstallmentId &&
      expenses.filter((e) => e.expenseInstallmentId === expense.expenseInstallmentId).length > 1
    ) {
      setDeleteAllInstallmentsDialogOpen(true)
    } else {
      // Regular expense, just show the normal delete dialog
      setDeleteExpenseDialogOpen(true)
    }
  }

  const confirmDeleteExpense = () => {
    if (expenseToDelete) {
      if (deleteAllInstallments && expenseToDelete.expenseInstallmentId) {
        // Collect all the IDs of installments to delete
        const installmentIds = expenses
          .filter((e) => e.expenseInstallmentId === expenseToDelete.expenseInstallmentId)
          .map((expense) => expense.id)

        // Use the new method if available, otherwise fall back to deleting one by one
        if (onDeleteMultipleExpenses) {
          onDeleteMultipleExpenses(installmentIds)
        } else {
          // Fallback to deleting one by one
          for (const id of installmentIds) {
            onDeleteExpense(id)
          }
        }
      } else {
        // Delete just this expense
        onDeleteExpense(expenseToDelete.id)
      }

      setDeleteExpenseDialogOpen(false)
      setDeleteAllInstallmentsDialogOpen(false)
      setExpenseToDelete(null)
      setDeleteAllInstallments(false)
    }
  }

  const handleDeleteAllInstallmentsConfirm = (deleteAll: boolean) => {
    setDeleteAllInstallments(deleteAll)
    setDeleteAllInstallmentsDialogOpen(false)
    setDeleteExpenseDialogOpen(true)
  }

  const handleDeleteIncome = (income: Income) => {
    setIncomeToDelete(income)
    setDeleteIncomeDialogOpen(true)
  }

  const confirmDeleteIncome = () => {
    if (incomeToDelete) {
      onDeleteIncome(incomeToDelete.id)
      setDeleteIncomeDialogOpen(false)
      setIncomeToDelete(null)
    }
  }

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteCategoryDialogOpen(true)
  }

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete.id)
      setDeleteCategoryDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleDeleteCreditCard = (creditCard: CreditCard) => {
    setCreditCardToDelete(creditCard)
    setDeleteCreditCardDialogOpen(true)
  }

  const confirmDeleteCreditCard = () => {
    if (creditCardToDelete) {
      // Check if credit card is used in any expense
      const cardInUse = expenses.some((expense) => expense.creditCardId === creditCardToDelete.id)
      if (cardInUse) {
        alert("Cannot delete credit card that is used in expenses")
        setDeleteCreditCardDialogOpen(false)
        setCreditCardToDelete(null)
        return
      }

      onDeleteCreditCard(creditCardToDelete.id)
      setDeleteCreditCardDialogOpen(false)
      setCreditCardToDelete(null)
    }
  }

  const monthlyExpenses = useMemo(() => getMonthlyExpenses(expenses, selectedMonth), [expenses, selectedMonth])

  const monthlyIncomes = useMemo(() => getMonthlyIncomes(incomes, selectedMonth), [incomes, selectedMonth])

  const getCategoryById = (id: string) => {
    return categories.find((cat) => cat.id === id) || { name: "Unknown", color: "#999999" }
  }

  const getCreditCardById = (id: string) => {
    return creditCards.find((card) => card.id === id) || null
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>

        <ScrollableSelect
          value={selectedMonth}
          onValueChange={setSelectedMonth}
          options={allOptions}
          currentOption={currentOption}
        />
      </div>

      <Tabs defaultValue="expenses">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="creditcards">Credit Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4 mt-4">
          {monthlyExpenses.length > 0 ? (
            monthlyExpenses.map((expense) => {
              const category = getCategoryById(expense.categoryId)
              const creditCard = expense.creditCardId ? getCreditCardById(expense.creditCardId) : null

              return (
                <Card key={expense.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: category.color }} />
                      <div>
                        <div className="font-medium">{expense.description || category.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(expense.date)}
                          {creditCard && (
                            <span className="ml-2 text-blue-500">
                              ({creditCard.description} - Due: {formatDate(expense.executionDate || expense.date)})
                            </span>
                          )}
                          {expense.installmentQuantity && expense.installmentNumber && (
                            <span className="ml-2 text-purple-500">
                              (Installment {expense.installmentNumber}/{expense.installmentQuantity})
                            </span>
                          )}
                          {expense.isPaid && <span className="ml-2 text-green-500">(Paid)</span>}
                          {expense.isRecurring && <span className="ml-2 text-teal-500">(Recurring)</span>}
                        </div>
                        {expense.totalAmount && expense.installmentQuantity && (
                          <div className="text-xs text-muted-foreground">
                            Total: {formatCurrency(expense.totalAmount)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className="font-medium mr-4">{formatCurrency(expense.amount)}</span>

                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditExpense(expense)}
                        >
                          <Edit2Icon className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDeleteExpense(expense)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">No expenses for this month.</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="income" className="space-y-4 mt-4">
          {monthlyIncomes.length > 0 ? (
            monthlyIncomes.map((income) => (
              <Card key={income.id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{income.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(income.date)}
                      {income.isPaused && <span className="ml-2 text-amber-500">(Paused)</span>}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="font-medium text-green-500 mr-4">{formatCurrency(income.amount)}</span>

                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditIncome(income)}>
                        <Edit2Icon className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => handleDeleteIncome(income)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">No income for this month.</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Budget Categories</h2>
            <Button onClick={onAddCategory} size="sm" variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: category.color }} />
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-muted-foreground">Budget: {formatCurrency(category.budget || 0)}</div>
                  </div>
                </div>

                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCategory(category)}>
                    <Edit2Icon className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => handleDeleteCategory(category)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {categories.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No categories yet. Add your first category to get started.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="creditcards" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Credit Cards</h2>
            <Button onClick={onAddCreditCard} size="sm" variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Credit Card
            </Button>
          </div>

          {creditCards.map((creditCard) => (
            <Card key={creditCard.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-3 text-blue-500" />
                  <div>
                    <div className="font-medium">{creditCard.description}</div>
                    <div className="text-xs text-muted-foreground">
                      Closing: Day {creditCard.closingDay} | Due: Day {creditCard.dueDay} | Good Thru:{" "}
                      {formatGoodThruDate(creditCard.goodThruDate)}
                      {creditCard.isPaused && <span className="ml-2 text-amber-500">(Paused)</span>}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditCreditCard(creditCard)}
                  >
                    <Edit2Icon className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => handleDeleteCreditCard(creditCard)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {creditCards.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No credit cards yet. Add your first credit card to get started.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialogs */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>

          {editingExpense && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingExpense.description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                  placeholder="Description (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editingExpense.amount}
                  onChange={(e) =>
                    setEditingExpense({ ...editingExpense, amount: Number.parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editingExpense.categoryId}
                  onValueChange={(value) => setEditingExpense({ ...editingExpense, categoryId: value })}
                >
                  <SelectTrigger id="edit-category">
                    {editingExpense?.categoryId ? (
                      <div className="flex items-center">
                        <SelectValue placeholder="Select category" />
                      </div>
                    ) : (
                      <SelectValue placeholder="Select category" />
                    )}
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
                            style={{
                              backgroundColor: categories.find((category) => category.name === "Others")!.color,
                            }}
                          />
                          Others
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {editingExpense.expenseInstallmentId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Note: Changing the category will update all installments of this expense.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-credit-card">Credit Card (optional)</Label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 relative">
                    <Select
                      value={editingExpense.creditCardId || ""}
                      onValueChange={(value) =>
                        setEditingExpense({ ...editingExpense, creditCardId: value || undefined })
                      }
                      disabled={creditCards.filter((card) => !card.isPaused).length === 0}
                    >
                      <SelectTrigger id="edit-credit-card">
                        <SelectValue
                          placeholder={
                            creditCards.filter((card) => !card.isPaused).length === 0
                              ? "No credit cards available"
                              : "Select credit card"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {creditCards
                          .filter((card) => !card.isPaused)
                          .map((card) => (
                            <SelectItem key={card.id} value={card.id}>
                              {card.description}
                            </SelectItem>
                          ))}
                        {creditCards.filter((card) => !card.isPaused).length === 0 && (
                          <SelectItem value="no-cards-available" disabled>
                            No credit cards available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {editingExpense.creditCardId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setEditingExpense({ ...editingExpense, creditCardId: undefined })}
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
                {creditCards.filter((card) => !card.isPaused).length === 0 && (
                  <p className="text-xs text-muted-foreground">Add a credit card in Settings to enable this option</p>
                )}
              </div>

              {editingExpense.installmentQuantity && editingExpense.installmentNumber && (
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-sm">
                    This is installment {editingExpense.installmentNumber} of {editingExpense.installmentQuantity}
                  </p>
                  {editingExpense.totalAmount && (
                    <p className="text-sm">Total amount: {formatCurrency(editingExpense.totalAmount)}</p>
                  )}
                </div>
              )}

              {editingExpense.installmentQuantity && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-expense-paid"
                    checked={editingExpense.isPaid || false}
                    onCheckedChange={(checked) => setEditingExpense({ ...editingExpense, isPaid: checked })}
                  />
                  <Label htmlFor="edit-expense-paid">Mark as paid</Label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-expense-recurring"
                  checked={editingExpense.isRecurring || false}
                  onCheckedChange={(checked) => setEditingExpense({ ...editingExpense, isRecurring: checked })}
                />
                <Label htmlFor="edit-expense-recurring">Recurring monthly expense</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingExpense.date}
                  onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                />
              </div>

              <Button className="w-full" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>

          {editingCategory && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-category-name">Name</Label>
                <Input
                  id="edit-category-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category-budget">Monthly Budget</Label>
                <Input
                  id="edit-category-budget"
                  type="number"
                  value={editingCategory.budget || 0}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, budget: Number.parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category-color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-category-color"
                    type="color"
                    value={editingCategory.color}
                    onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: editingCategory.color }} />
                </div>
              </div>

              <Button className="w-full" onClick={handleSaveCategoryEdit}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Income</DialogTitle>
          </DialogHeader>

          {editingIncome && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-income-description">Description</Label>
                <Input
                  id="edit-income-description"
                  value={editingIncome.description}
                  onChange={(e) => setEditingIncome({ ...editingIncome, description: e.target.value })}
                  placeholder="Description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-income-amount">Amount</Label>
                <Input
                  id="edit-income-amount"
                  type="number"
                  value={editingIncome.amount}
                  onChange={(e) =>
                    setEditingIncome({ ...editingIncome, amount: Number.parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-income-paused"
                  checked={editingIncome.isPaused}
                  onCheckedChange={(checked) => setEditingIncome({ ...editingIncome, isPaused: checked })}
                />
                <Label htmlFor="edit-income-paused">Pause this income</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-income-date">Date</Label>
                <Input
                  id="edit-income-date"
                  type="date"
                  value={editingIncome.date}
                  onChange={(e) => setEditingIncome({ ...editingIncome, date: e.target.value })}
                />
              </div>

              <Button className="w-full" onClick={handleSaveIncomeEdit}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={creditCardDialogOpen} onOpenChange={setCreditCardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Credit Card</DialogTitle>
          </DialogHeader>

          {editingCreditCard && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-credit-card-description">Description</Label>
                <Input
                  id="edit-credit-card-description"
                  value={editingCreditCard.description}
                  onChange={(e) => setEditingCreditCard({ ...editingCreditCard, description: e.target.value })}
                  placeholder="e.g., Visa, Mastercard"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-credit-card-closing-day">Closing Day (1-30)</Label>
                <Input
                  id="edit-credit-card-closing-day"
                  type="number"
                  value={editingCreditCard.closingDay}
                  onChange={(e) =>
                    setEditingCreditCard({
                      ...editingCreditCard,
                      closingDay: Math.max(1, Math.min(30, Number.parseInt(e.target.value) || 1)),
                    })
                  }
                  min="1"
                  max="30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-credit-card-due-day">Due Day (1-30)</Label>
                <Input
                  id="edit-credit-card-due-day"
                  type="number"
                  value={editingCreditCard.dueDay}
                  onChange={(e) =>
                    setEditingCreditCard({
                      ...editingCreditCard,
                      dueDay: Math.max(1, Math.min(30, Number.parseInt(e.target.value) || 1)),
                    })
                  }
                  min="1"
                  max="30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-credit-card-good-thru">Good Thru (Month/Year)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={editingGoodThruMonth} onValueChange={setEditingGoodThruMonth}>
                    <SelectTrigger id="edit-credit-card-good-thru-month">
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

                  <Select value={editingGoodThruYear} onValueChange={setEditingGoodThruYear}>
                    <SelectTrigger id="edit-credit-card-good-thru-year">
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
                <Switch
                  id="edit-credit-card-paused"
                  checked={editingCreditCard.isPaused}
                  onCheckedChange={(checked) => setEditingCreditCard({ ...editingCreditCard, isPaused: checked })}
                />
                <Label htmlFor="edit-credit-card-paused">Pause this credit card</Label>
              </div>

              <Button className="w-full" onClick={handleSaveCreditCardEdit}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete All Installments Dialog */}
      <AlertDialog open={deleteAllInstallmentsDialogOpen} onOpenChange={setDeleteAllInstallmentsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Installments</AlertDialogTitle>
            <AlertDialogDescription>
              This expense is part of an installment plan. Would you like to delete all installments or just this one?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAllInstallmentsDialogOpen(false)}>Cancel</AlertDialogCancel>
            <Button variant="outline" onClick={() => handleDeleteAllInstallmentsConfirm(false)}>
              Delete Only This One
            </Button>
            <AlertDialogAction
              onClick={() => handleDeleteAllInstallmentsConfirm(true)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete All Installments
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialogs */}
      <AlertDialog open={deleteExpenseDialogOpen} onOpenChange={setDeleteExpenseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              {expenseToDelete && (
                <>
                  Are you sure you want to delete this expense?
                  <div className="mt-2 p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{
                          backgroundColor: getCategoryById(expenseToDelete.categoryId).color,
                        }}
                      />
                      <div className="font-medium">
                        {expenseToDelete.description || getCategoryById(expenseToDelete.categoryId).name}
                      </div>
                    </div>
                    <div className="text-sm font-medium mt-1">{formatCurrency(expenseToDelete.amount)}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(expenseToDelete.date)}</div>
                    {deleteAllInstallments && expenseToDelete.expenseInstallmentId && (
                      <div className="text-xs text-amber-500 mt-1">
                        All installments of this expense will be deleted.
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm font-medium">This action cannot be undone.</div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setExpenseToDelete(null)
                setDeleteAllInstallments(false)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteExpense} className="bg-red-500 hover:bg-red-600">
              Delete Expense
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteIncomeDialogOpen} onOpenChange={setDeleteIncomeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Delete Income</AlertDialogTitle>
            <AlertDialogDescription>
              {incomeToDelete && (
                <>
                  Are you sure you want to delete this income?
                  <div className="mt-2 p-3 bg-muted/50 rounded-md">
                    <div className="font-medium">{incomeToDelete.description}</div>
                    <div className="text-sm text-green-500 font-medium">{formatCurrency(incomeToDelete.amount)}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(incomeToDelete.date)}</div>
                  </div>
                  <div className="mt-2 text-sm font-medium">This action cannot be undone.</div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIncomeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteIncome} className="bg-red-500 hover:bg-red-600">
              Delete Income
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete && (
                <>
                  Are you sure you want to delete this category?
                  <div className="mt-2 p-3 bg-muted/50 rounded-md flex items-center">
                    <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: categoryToDelete.color }} />
                    <div>
                      <div className="font-medium">{categoryToDelete.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Budget: {formatCurrency(categoryToDelete.budget || 0)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-medium">This action cannot be undone.</div>
                  <div className="mt-1 text-xs text-amber-500">
                    Note: You cannot delete a category that is used by any expense.
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-red-500 hover:bg-red-600">
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteCreditCardDialogOpen} onOpenChange={setDeleteCreditCardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Delete Credit Card</AlertDialogTitle>
            <AlertDialogDescription>
              {creditCardToDelete && (
                <>
                  Are you sure you want to delete this credit card?
                  <div className="mt-2 p-3 bg-muted/50 rounded-md flex items-center">
                    <CreditCardIcon className="h-5 w-5 mr-3 text-blue-500" />
                    <div>
                      <div className="font-medium">{creditCardToDelete.description}</div>
                      <div className="text-xs text-muted-foreground">
                        Closing: Day {creditCardToDelete.closingDay} | Due: Day {creditCardToDelete.dueDay}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-medium">This action cannot be undone.</div>
                  <div className="mt-1 text-xs text-amber-500">
                    Note: You cannot delete a credit card that is used by any expense.
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCreditCardToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCreditCard} className="bg-red-500 hover:bg-red-600">
              Delete Credit Card
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
