"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Edit2Icon, Trash2Icon, PlusCircle } from "lucide-react"
import { calculateInterestEarned, calculateTotalInterest, formatCurrency, formatDate } from "@/lib/utils"

export interface Reserve {
  id: string
  name?: string
  amount: number
  creationDate: string
  dissolutionDate?: string
  interestRate?: number
}

interface TransactionsReservesTabProps {
  reserves: Reserve[]
  onUpdateReserve: (reserve: Reserve) => void
  onDeleteReserve: (id: string) => void
  onAddReserve: () => void
}

export default function TransactionsReservesTab({
  reserves,
  onUpdateReserve,
  onDeleteReserve,
  onAddReserve,
}: TransactionsReservesTabProps) {
  // Edit states
  const [editingReserve, setEditingReserve] = useState<Reserve | null>(null)
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false)

  // Delete states
  const [deleteReserveDialogOpen, setDeleteReserveDialogOpen] = useState(false)
  const [reserveToDelete, setReserveToDelete] = useState<Reserve | null>(null)

  const handleEditReserve = (reserve: Reserve) => {
    setEditingReserve({ ...reserve })
    setReserveDialogOpen(true)
  }

  const handleSaveReserveEdit = () => {
    if (editingReserve) {
      onUpdateReserve(editingReserve)
      setReserveDialogOpen(false)
      setEditingReserve(null)
    }
  }

  const handleDeleteReserve = (reserve: Reserve) => {
    setReserveToDelete(reserve)
    setDeleteReserveDialogOpen(true)
  }

  const confirmDeleteReserve = () => {
    if (reserveToDelete) {
      onDeleteReserve(reserveToDelete.id)
      setDeleteReserveDialogOpen(false)
      setReserveToDelete(null)
    }
  }



  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Reserves</h2>
        <Button onClick={onAddReserve} size="sm" variant="outline">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Reserve
        </Button>
      </div>

      {reserves.length > 0 ? (
        reserves.map((reserve) => {
          const futureValue = reserve.dissolutionDate ? calculateTotalInterest(reserve) + reserve.amount: 0
          const hasInterest = reserve.interestRate && reserve.interestRate > 0

          return (
            <Card key={reserve.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{(reserve.name || "Unnamed Reserve") + ": " + formatCurrency(reserve.amount)}</div>
                  <div className="text-xs text-muted-foreground">
                    Created: {formatDate(reserve.creationDate)}
                    {reserve.dissolutionDate && (
                      <span className="ml-2">Dissolution: {formatDate(reserve.dissolutionDate)}</span>
                    )}
                    {reserve.interestRate && <span className="ml-2">Interest: {reserve.interestRate}%</span>}
                  </div>
                  {hasInterest && reserve.dissolutionDate && (
                    <div className="text-xs text-green-500 mt-1">Future value: {formatCurrency(futureValue)}</div>
                  )}
                </div>

                <div className="flex items-center">
                  <span className="font-medium mr-4">{formatCurrency(reserve.amount+ calculateInterestEarned(reserve))}</span>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditReserve(reserve)}>
                      <Edit2Icon className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => handleDeleteReserve(reserve)}
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
          <CardContent className="p-6 text-center text-muted-foreground">
            No reserves yet. Add your first reserve to get started.
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={reserveDialogOpen} onOpenChange={setReserveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reserve</DialogTitle>
          </DialogHeader>

          {editingReserve && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-reserve-name">Name (optional)</Label>
                <Input
                  id="edit-reserve-name"
                  value={editingReserve.name || ""}
                  onChange={(e) => setEditingReserve({ ...editingReserve, name: e.target.value })}
                  placeholder="e.g., Emergency Fund, Vacation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-reserve-amount">Amount</Label>
                <Input
                  id="edit-reserve-amount"
                  type="number"
                  value={editingReserve.amount}
                  onChange={(e) =>
                    setEditingReserve({ ...editingReserve, amount: Number.parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-reserve-interest">Interest Rate % (optional)</Label>
                <Input
                  id="edit-reserve-interest"
                  type="number"
                  value={editingReserve.interestRate || ""}
                  onChange={(e) =>
                    setEditingReserve({
                      ...editingReserve,
                      interestRate: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                    })
                  }
                  min="0"
                  step="0.01"
                  placeholder="e.g., 2.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-reserve-creation-date">Creation Date</Label>
                <Input
                  id="edit-reserve-creation-date"
                  type="date"
                  value={editingReserve.creationDate}
                  onChange={(e) => setEditingReserve({ ...editingReserve, creationDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-reserve-dissolution-date">Dissolution Date (optional)</Label>
                <Input
                  id="edit-reserve-dissolution-date"
                  type="date"
                  value={editingReserve.dissolutionDate || ""}
                  onChange={(e) =>
                    setEditingReserve({ ...editingReserve, dissolutionDate: e.target.value || undefined })
                  }
                  min={editingReserve.creationDate}
                />
              </div>

              <Button className="w-full" onClick={handleSaveReserveEdit}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteReserveDialogOpen} onOpenChange={setDeleteReserveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Delete Reserve</AlertDialogTitle>
            <AlertDialogDescription>
              {reserveToDelete && (
                <>
                  Are you sure you want to delete this reserve?
                  <div className="mt-2 p-3 bg-muted/50 rounded-md">
                    <div className="font-medium">{reserveToDelete.name || "Unnamed Reserve"}</div>
                    <div className="text-sm font-medium">{formatCurrency(reserveToDelete.amount)}</div>
                    <div className="text-xs text-muted-foreground">
                      Created: {formatDate(reserveToDelete.creationDate)}
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-medium">This action cannot be undone.</div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReserveToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteReserve} className="bg-red-500 hover:bg-red-600">
              Delete Reserve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
