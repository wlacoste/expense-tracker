"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { formatCurrency, formatDate } from "@/lib/utils"

interface Income {
  id: string
  amount: number
  description: string
  date: string
  isPaused: boolean
}

interface TransactionsIncomeTabProps {
  incomes: Income[]
  onUpdateIncome: (income: Income) => void
  onDeleteIncome: (id: string) => void
}

export default function TransactionsIncomeTab({ incomes, onUpdateIncome, onDeleteIncome }: TransactionsIncomeTabProps) {
  // Edit states
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false)

  // Delete states
  const [deleteIncomeDialogOpen, setDeleteIncomeDialogOpen] = useState(false)
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null)

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

  return (
    <div className="space-y-4">
      {incomes.length > 0 ? (
        incomes.map((income) => (
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

      {/* Edit Dialog */}
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

      {/* Delete Dialog */}
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
    </div>
  )
}

export type { Income }
