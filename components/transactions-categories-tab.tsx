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
import { Edit2Icon, Trash2Icon, PlusCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Category {
  id: string
  name: string
  color: string
  budget?: number
  orderNumber: number
  isDisabled: boolean
}

interface TransactionsCategoriesTabProps {
  categories: Category[]
  expenses: any[] // Used to check if a category is in use
  onUpdateCategory: (category: Category) => void
  onDeleteCategory: (id: string) => void
  onAddCategory: () => void
}

// Category item component for enabled categories
function CategoryItem({
  category,
  onEdit,
  onDelete,
}: {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}) {
  const isOthers = category.name === "Others"

  return (
    <Card className="mb-4">
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: category.color }} />
          <div>
            <div className="font-medium">{category.name}</div>
            <div className="text-xs text-muted-foreground">Budget: {formatCurrency(category.budget || 0)}</div>
          </div>
        </div>

        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(category)}>
            <Edit2Icon className="h-4 w-4" />
          </Button>

          {!isOthers && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete(category)}>
              <Trash2Icon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Non-sortable category item for disabled categories
function DisabledCategoryItem({
  category,
  onEdit,
  onDelete,
}: {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}) {
  const isOthers = category.name === "Others"

  return (
    <Card className="mb-4 opacity-60">
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: category.color }} />
          <div>
            <div className="font-medium">{category.name}</div>
            <div className="text-xs text-muted-foreground">
              Budget: {formatCurrency(category.budget || 0)}
              <span className="ml-2 text-amber-500">(Disabled)</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(category)}>
            <Edit2Icon className="h-4 w-4" />
          </Button>

          {!isOthers && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete(category)}>
              <Trash2Icon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function TransactionsCategoriesTab({
  categories,
  expenses,
  onUpdateCategory,
  onDeleteCategory,
  onAddCategory,
}: TransactionsCategoriesTabProps) {
  // Edit states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)

  // Delete states
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  // Separate enabled and disabled categories
  const enabledCategories = categories
    .filter((cat) => !cat.isDisabled)
    .sort((a, b) => {
      // Always place "Others" at the bottom
      if (a.name === "Others") return 1
      if (b.name === "Others") return -1
      // Otherwise sort by orderNumber
      return a.orderNumber - b.orderNumber
    })

  const disabledCategories = categories.filter((cat) => cat.isDisabled).sort((a, b) => a.name.localeCompare(b.name)) // Sort disabled by name

  const handleEditCategory = (category: Category) => {
    setEditingCategory({ ...category })
    setCategoryDialogOpen(true)
  }

  const handleSaveCategoryEdit = () => {
    if (editingCategory) {
      const updatedCategory = { ...editingCategory }

      // If we're enabling a previously disabled category
      if (editingCategory.isDisabled && !updatedCategory.isDisabled) {
        // Assign it the next available orderNumber
        updatedCategory.orderNumber = enabledCategories.length
      }

      onUpdateCategory(updatedCategory)
      setCategoryDialogOpen(false)
      setEditingCategory(null)
    }
  }

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteCategoryDialogOpen(true)
  }

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      // Check if category is used in any expense
      const categoryInUse = expenses.some((expense) => expense.categoryId === categoryToDelete.id)
      if (categoryInUse) {
        alert("Cannot delete category that is used in expenses")
        setDeleteCategoryDialogOpen(false)
        setCategoryToDelete(null)
        return
      }

      onDeleteCategory(categoryToDelete.id)

      // If this was an enabled category, we need to reorder the remaining categories
      if (!categoryToDelete.isDisabled) {
        const remainingEnabledCategories = enabledCategories
          .filter((cat) => cat.id !== categoryToDelete.id)
          .sort((a, b) => a.orderNumber - b.orderNumber)

        // Update orderNumbers to ensure they remain continuous
        remainingEnabledCategories.forEach((category, index) => {
          if (category.orderNumber !== index) {
            onUpdateCategory({
              ...category,
              orderNumber: index,
            })
          }
        })
      }

      setDeleteCategoryDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Budget Categories</h2>
        <Button onClick={onAddCategory} size="sm" variant="outline">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Enabled Categories Section */}
      <div className="space-y-2">
        {enabledCategories.length > 0 ? (
          <div>
            {enabledCategories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              No enabled categories. Enable a category or add a new one.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Disabled Categories Section */}
      {disabledCategories.length > 0 && (
        <div className="space-y-2 mt-6">
          <h3 className="text-sm font-medium">Disabled Categories</h3>
          <div>
            {disabledCategories.map((category) => (
              <DisabledCategoryItem
                key={category.id}
                category={category}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            ))}
          </div>
        </div>
      )}

      {categories.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No categories yet. Add your first category to get started.
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-category-enabled"
                  checked={!editingCategory?.isDisabled}
                  onCheckedChange={(checked) => setEditingCategory({ ...editingCategory!, isDisabled: !checked })}
                />
                <Label htmlFor="edit-category-enabled">Enable this category</Label>
              </div>

              <Button className="w-full" onClick={handleSaveCategoryEdit}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
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
    </div>
  )
}
