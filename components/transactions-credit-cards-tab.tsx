"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Edit2Icon, Trash2Icon, PlusCircle, CreditCardIcon, StarIcon } from "lucide-react"

interface CreditCard {
  id: string
  description: string
  closingDay: number
  dueDay: number
  goodThruDate: string
  isPaused: boolean
}

interface TransactionsCreditCardsTabProps {
  creditCards: CreditCard[]
  expenses: any[] // Used to check if a credit card is in use
  onUpdateCreditCard: (creditCard: CreditCard) => void
  onDeleteCreditCard: (id: string) => void
  onAddCreditCard: () => void
  favoriteCreditCardId?: string
  onToggleFavoriteCreditCard: (id: string) => void
}

export default function TransactionsCreditCardsTab({
  creditCards,
  expenses,
  onUpdateCreditCard,
  onDeleteCreditCard,
  onAddCreditCard,
  favoriteCreditCardId,
  onToggleFavoriteCreditCard,
}: TransactionsCreditCardsTabProps) {
  // Edit states
  const [editingCreditCard, setEditingCreditCard] = useState<CreditCard | null>(null)
  const [creditCardDialogOpen, setCreditCardDialogOpen] = useState(false)
  const [editingGoodThruMonth, setEditingGoodThruMonth] = useState("")
  const [editingGoodThruYear, setEditingGoodThruYear] = useState("")

  // Delete states
  const [deleteCreditCardDialogOpen, setDeleteCreditCardDialogOpen] = useState(false)
  const [creditCardToDelete, setCreditCardToDelete] = useState<CreditCard | null>(null)

  const formatGoodThruDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
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

  return (
    <div className="space-y-4">
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
                className={`h-8 w-8 ${favoriteCreditCardId === creditCard.id ? "text-yellow-500" : "text-muted-foreground"}`}
                onClick={() => onToggleFavoriteCreditCard(creditCard.id)}
                title={favoriteCreditCardId === creditCard.id ? "Remove from favorites" : "Add to favorites"}
              >
                <StarIcon className="h-4 w-4" fill={favoriteCreditCardId === creditCard.id ? "currentColor" : "none"} />
              </Button>

              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCreditCard(creditCard)}>
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

      {/* Edit Dialog */}
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

      {/* Delete Dialog */}
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
