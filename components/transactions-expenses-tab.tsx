"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
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
import { Edit2Icon, Trash2Icon } from "lucide-react"
import { formatCurrency, formatDate, calculateExecutionDate, getFormattedDate } from "@/lib/utils"

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

interface TransactionsExpensesTabProps {
  expenses: Expense[]
  categories: Category[]
  creditCards: CreditCard[]
  onUpdateExpense: (expense: Expense) => void
  onDeleteExpense: (id: string) => void
  onDeleteMultipleExpenses?: (ids: string[]) => void
}

export default function TransactionsExpensesTab({
  expenses,
  categories,
  creditCards,
  onUpdateExpense,
  onDeleteExpense,
  onDeleteMultipleExpenses,
}: TransactionsExpensesTabProps) {
  // Edit states
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // Delete states
  const [deleteExpenseDialogOpen, setDeleteExpenseDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)

  // New state for delete all installments dialog
  const [deleteAllInstallmentsDialogOpen, setDeleteAllInstallmentsDialogOpen] = useState(false)
  const [deleteAllInstallments, setDeleteAllInstallments] = useState(false)

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense({ ...expense })
    setEditDialogOpen(true)
  }

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

  const getCategoryById = (id: string) => {
    return categories.find((cat) => cat.id === id) || { name: "Unknown", color: "#999999" }
  }

  const getCreditCardById = (id: string) => {
    return creditCards.find((card) => card.id === id) || null
  }

  return (
    <div className="space-y-4">
      {expenses.length > 0 ? (
        expenses.map((expense) => {
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
                      <div className="text-xs text-muted-foreground">Total: {formatCurrency(expense.totalAmount)}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="font-medium mr-4">{formatCurrency(expense.amount)}</span>

                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditExpense(expense)}>
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

      {/* Edit Dialog */}
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
                      .filter((category) => category.name !== "Others" && !category.isDisabled)
                      .sort((a, b) => a.orderNumber - b.orderNumber)
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

      {/* Delete Expense Dialog */}
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
    </div>
  )
}
