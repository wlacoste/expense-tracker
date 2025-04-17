"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { ChevronDown, ChevronRight, PlusCircle } from "lucide-react"
import type { CategorySectionProps } from "./types"
import { formatDate } from "./useDashboard"

export function CategorySection({
  categories,
  monthlyExpenses,
  currentDateStr,
  expandedCategories,
  toggleCategoryExpansion,
  onAddCategory,
  onAddExpenseWithCategory,
  categorySorting,
  setCategorySorting,
  language,
  t,
}: CategorySectionProps) {
  // Group expenses by category for the current month
  const expensesByCategory: Record<string, any[]> = {}

  // Initialize with empty arrays for all categories
  categories.forEach((category) => {
    expensesByCategory[category.id] = []
  })

  // Add expenses to their respective categories
  monthlyExpenses.forEach((expense) => {
    if (expensesByCategory[expense.categoryId]) {
      expensesByCategory[expense.categoryId].push(expense)
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold mt-1 text-foreground">{t.dashboard.categories.title}</h2>
          <Select defaultValue={categorySorting} onValueChange={setCategorySorting}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chronological">Chronologically</SelectItem>
              <SelectItem value="chronological-inverse">Chronologically Inverse</SelectItem>
              <SelectItem value="alphabetical">Alphabetically</SelectItem>
              <SelectItem value="alphabetical-inverse">Alphabetically Inverse</SelectItem>
              <SelectItem value="budget">By Budget</SelectItem>
              <SelectItem value="budget-inverse">By Budget Inverse</SelectItem>
              <SelectItem value="last-expense">By Last Expense</SelectItem>
              <SelectItem value="last-expense-inverse">By Last Expense Inverse</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddCategory} size="sm" variant="outline">
          <PlusCircle className="h-4 w-4 mr-2" />
          {t.dashboard.categories.add}
        </Button>
      </div>

      {/* Budget Categories Section */}
      <div className="space-y-4">
        {categories
          .filter((category) => {
            // Always filter out "Others" category
            if (category.name === "Others") return false

            // Handle disabled categories
            if (category.isDisabled) {
              // Only include disabled categories if they have monthly expenses
              const hasExpenses = monthlyExpenses.some((expense) => expense.categoryId === category.id)
              return hasExpenses
            }

            // Include all enabled categories
            return true
          })
          .sort((a, b) => {
            // Get the newest expense date for each category (for last-expense sorting)
            const getNewestExpenseDate = (categoryId: string) => {
              const categoryExpenses = monthlyExpenses.filter((exp) => exp.categoryId === categoryId)
              if (categoryExpenses.length === 0) return new Date(0) // No expenses
              return new Date(Math.max(...categoryExpenses.map((exp) => new Date(exp.date).getTime())))
            }

            // Always place "Others" at the bottom regardless of sorting
            if (a.name === "Others") return 1
            if (b.name === "Others") return -1

            // Apply the selected sorting method
            switch (categorySorting) {
              case "chronological":
                return a.orderNumber - b.orderNumber
              case "chronological-inverse":
                return b.orderNumber - a.orderNumber
              case "alphabetical":
                return a.name.localeCompare(b.name)
              case "alphabetical-inverse":
                return b.name.localeCompare(a.name)
              case "budget":
                return (b.budget || 0) - (a.budget || 0)
              case "budget-inverse":
                return (a.budget || 0) - (b.budget || 0)
              case "last-expense": {
                const dateA = getNewestExpenseDate(a.id)
                const dateB = getNewestExpenseDate(b.id)
                return dateB.getTime() - dateA.getTime() // Newest first
              }
              case "last-expense-inverse": {
                const dateA = getNewestExpenseDate(a.id)
                const dateB = getNewestExpenseDate(b.id)
                return dateA.getTime() - dateB.getTime() // Oldest first
              }
              default:
                return a.orderNumber - b.orderNumber
            }
          })
          .map((category) => {
            // Get all expenses for this category
            const allExpensesForCategory = monthlyExpenses.filter((expense) => expense.categoryId === category.id)

            // Split into executed and pending expenses
            const executedExpenses = allExpensesForCategory.filter(
              (expense) => !expense.executionDate || expense.executionDate <= currentDateStr,
            )
            const pendingExpenses = allExpensesForCategory.filter(
              (expense) => expense.executionDate && expense.executionDate > currentDateStr,
            )

            const executedAmount = executedExpenses.reduce((sum, expense) => sum + expense.amount, 0)
            const pendingAmount = pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0)
            const totalSpent = executedAmount + pendingAmount

            const budget = category.budget || 0
            const executedPercentage = budget > 0 ? Math.min(Math.round((executedAmount / budget) * 100), 100) : 0
            const pendingPercentage = budget > 0 ? Math.min(Math.round((pendingAmount / budget) * 100), 100) : 0
            const isOverBudget = totalSpent > budget && budget > 0

            // Get the category's expenses
            const categoryExpenses = expensesByCategory[category.id] || []
            const isExpanded = expandedCategories[category.id] || false

            return (
              <Card
                key={category.id}
                className={`${isOverBudget ? "border-red-500" : ""} ${!category.isDisabled ? "cursor-pointer hover:bg-accent/50 transition-colors" : "opacity-50"}`}
                onClick={!category.isDisabled ? () => onAddExpenseWithCategory(category.id) : undefined}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <button
                        className="mr-2 p-1 rounded-full hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
                        onClick={(e) => toggleCategoryExpansion(category.id, e)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-sm">
                      <span className={isOverBudget ? "text-red-500 font-bold" : ""}>
                        {formatCurrency(executedAmount)}
                      </span>
                      {pendingAmount > 0 && (
                        <span className="text-muted-foreground">
                          {" "}
                          + {formatCurrency(pendingAmount)} {t.dashboard.creditCard.pendingSmall}
                        </span>
                      )}
                      {budget > 0 && <span className="text-muted-foreground"> / {formatCurrency(budget)}</span>}
                    </div>
                  </div>

                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    {/* Executed expenses bar */}
                    <div
                      className={`h-full ${isOverBudget ? "bg-red-500" : "bg-primary"}`}
                      style={{ width: `${executedPercentage}%`, float: "left" }}
                    />
                    {/* Pending expenses bar */}
                    <div className="h-full bg-amber-500" style={{ width: `${pendingPercentage}%`, float: "left" }} />
                  </div>

                  {isOverBudget && (
                    <p className="text-xs text-red-500 mt-1">
                      {t.dashboard.categories.overBudget} {formatCurrency(totalSpent - budget)}
                    </p>
                  )}

                  {/* Animated collapsible section for expenses */}
                  <Collapsible open={isExpanded} className="mt-2">
                    <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                      <div
                        className="mt-1 pt-3 border-t border-border"
                        onClick={(e) => e.stopPropagation()} // Stop propagation
                      >
                        <div className="text-xs font-medium mb-2">Expenses</div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {categoryExpenses.length > 0 ? (
                            [...categoryExpenses]
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map((expense) => (
                                <div
                                  key={expense.id}
                                  className="flex justify-between items-center text-sm p-1 rounded hover:bg-muted/50"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium">{expense.description || category.name}</div>
                                    <div className="text-xs text-muted-foreground">{formatDate(expense.date)}</div>
                                  </div>
                                  <div className="font-medium">{formatCurrency(expense.amount)}</div>
                                </div>
                              ))
                          ) : (
                            <div className="text-sm text-muted-foreground text-center py-2">
                              No expenses in this category
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            )
          })}

        {/* Render the Others category at the end if it exists */}
        {categories.find((category) => category.name === "Others") &&
          (() => {
            const othersCategory = categories.find((category) => category.name === "Others")!
            const allExpensesForCategory = monthlyExpenses.filter((expense) => expense.categoryId === othersCategory.id)

            // Split into executed and pending expenses
            const executedExpenses = allExpensesForCategory.filter(
              (expense) => !expense.executionDate || expense.executionDate <= currentDateStr,
            )
            const pendingExpenses = allExpensesForCategory.filter(
              (expense) => expense.executionDate && expense.executionDate > currentDateStr,
            )

            const executedAmount = executedExpenses.reduce((sum, expense) => sum + expense.amount, 0)
            const pendingAmount = pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0)
            const totalSpent = executedAmount + pendingAmount

            const budget = othersCategory.budget || 0
            const executedPercentage = budget > 0 ? Math.min(Math.round((executedAmount / budget) * 100), 100) : 0
            const pendingPercentage = budget > 0 ? Math.min(Math.round((pendingAmount / budget) * 100), 100) : 0
            const isOverBudget = totalSpent > budget && budget > 0

            // Get the category's expenses
            const categoryExpenses = expensesByCategory[othersCategory.id] || []
            const isExpanded = expandedCategories[othersCategory.id] || false

            return (
              <Card
                key={othersCategory.id}
                className={`${isOverBudget ? "border-red-500" : ""} ${!othersCategory.isDisabled ? "cursor-pointer hover:bg-accent/50 transition-colors" : "opacity-50"}`}
                onClick={!othersCategory.isDisabled ? () => onAddExpenseWithCategory(othersCategory.id) : undefined}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <button
                        className="mr-2 p-1 rounded-full hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
                        onClick={(e) => toggleCategoryExpansion(othersCategory.id, e)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: othersCategory.color }} />
                      <span className="font-medium">{othersCategory.name}</span>
                    </div>
                    <div className="text-sm">
                      <span className={isOverBudget ? "text-red-500 font-bold" : ""}>
                        {formatCurrency(executedAmount)}
                      </span>
                      {pendingAmount > 0 && (
                        <span className="text-muted-foreground">
                          {" "}
                          + {formatCurrency(pendingAmount)} {t.dashboard.creditCard.pendingSmall}
                        </span>
                      )}
                      {budget > 0 && <span className="text-muted-foreground"> / {formatCurrency(budget)}</span>}
                    </div>
                  </div>

                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    {/* Executed expenses bar */}
                    <div
                      className={`h-full ${isOverBudget ? "bg-red-500" : "bg-primary"}`}
                      style={{ width: `${executedPercentage}%`, float: "left" }}
                    />
                    {/* Pending expenses bar */}
                    <div className="h-full bg-amber-500" style={{ width: `${pendingPercentage}%`, float: "left" }} />
                  </div>

                  {isOverBudget && (
                    <p className="text-xs text-red-500 mt-1">
                      {t.dashboard.categories.overBudget} {formatCurrency(totalSpent - budget)}
                    </p>
                  )}

                  {/* Animated collapsible section for expenses */}
                  <Collapsible open={isExpanded} className="mt-2">
                    <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                      <div className="mt-1 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
                        <div className="text-xs font-medium mb-2">Expenses</div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {categoryExpenses.length > 0 ? (
                            [...categoryExpenses].map((expense) => (
                              <div
                                key={expense.id}
                                className="flex justify-between items-center text-sm p-1 rounded hover:bg-muted/50"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">{expense.description || othersCategory.name}</div>
                                  <div className="text-xs text-muted-foreground">{formatDate(expense.date)}</div>
                                </div>
                                <div className="font-medium">{formatCurrency(expense.amount)}</div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground text-center py-2">
                              No expenses in this category
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            )
          })()}

        {categories.length === 0 && (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {t.dashboard.categories.noCategories}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
