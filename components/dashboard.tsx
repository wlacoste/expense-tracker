"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, getMonthlyExpenses, getMonthlyIncomes, generateMonthOptions } from "@/lib/utils"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PiggyBankIcon,
  WalletIcon,
  BarChart3Icon,
  PlusCircle,
  CreditCardIcon,
  AlertCircleIcon,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollableSelect } from "./scrollable-select"
import { getTranslations } from "@/lib/translations"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type AvailableLanguage = "en" | "es"

interface Expense {
  id: string
  amount: number
  date: string
  description?: string
  categoryId: string
  creditCardId?: string
  executionDate?: string
  isPaid?: boolean
}

interface Income {
  id: string
  amount: number
  date: string
  isPaused: boolean
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

interface DashboardProps {
  expenses: Expense[]
  incomes: Income[]
  categories: Category[]
  creditCards: CreditCard[]
  selectedMonth: string
  setSelectedMonth: (month: string) => void
  onAddCategory: () => void
  onAddExpenseWithCategory: (categoryId: string) => void
  language: string
}

export default function Dashboard({
  expenses,
  incomes,
  categories,
  creditCards,
  selectedMonth,
  setSelectedMonth,
  onAddCategory,
  onAddExpenseWithCategory,
  language,
}: DashboardProps) {
  const [creditCardsExpanded, setCreditCardsExpanded] = useState(true)
  // Add state to track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [categorySorting, setCategorySorting] = useState<string>("chronological")

  const monthlyExpenses = useMemo(() => getMonthlyExpenses(expenses, selectedMonth), [expenses, selectedMonth])
  const monthlyIncomes = useMemo(() => getMonthlyIncomes(incomes, selectedMonth), [incomes, selectedMonth])
  const t = getTranslations(language as AvailableLanguage)

  // Generate month options
  const { pastOptions, currentOption, futureOptions, currentYearMonth } = useMemo(
    () => generateMonthOptions(expenses, incomes),
    [expenses, incomes],
  )

  // Combine all options for the ScrollableSelect
  const allOptions = useMemo(() => {
    return [...pastOptions, currentOption, ...futureOptions]
  }, [pastOptions, currentOption, futureOptions])

  // Get current date for comparison
  const today = new Date()
  const currentDateStr = today.toISOString().split("T")[0]

  // Calculate adjusted monthly expenses (excluding future credit card expenses)
  const adjustedMonthlyExpenses = useMemo(() => {
    return monthlyExpenses.filter((expense) => {
      // Include if not a credit card expense
      if (!expense.creditCardId) return true

      // Include credit card expense only if execution date has passed or is today
      if (expense.executionDate && expense.executionDate <= currentDateStr) return true

      // Exclude future credit card expenses
      return false
    })
  }, [monthlyExpenses, currentDateStr])

  // Calculate credit card expenses for the current month
  const creditCardExpensesThisMonth = useMemo(() => {
    return monthlyExpenses.filter(
      (expense) => expense.creditCardId && expense.executionDate && expense.executionDate.startsWith(selectedMonth),
    )
  }, [monthlyExpenses, selectedMonth])

  // Calculate executed and pending credit card expenses
  const executedCreditCardExpenses = useMemo(() => {
    return creditCardExpensesThisMonth.filter(
      (expense) => expense.executionDate && expense.executionDate <= currentDateStr,
    )
  }, [creditCardExpensesThisMonth, currentDateStr])

  const pendingCreditCardExpenses = useMemo(() => {
    return creditCardExpensesThisMonth.filter(
      (expense) => expense.executionDate && expense.executionDate > currentDateStr,
    )
  }, [creditCardExpensesThisMonth, currentDateStr])

  // Calculate per credit card metrics
  const creditCardMetrics = useMemo(() => {
    if (!creditCards.length) return []

    // Get next month
    const [year, month] = selectedMonth.split("-").map(Number)
    let nextMonthYear = year
    let nextMonth = month + 1

    if (nextMonth > 12) {
      nextMonth = 1
      nextMonthYear++
    }

    const nextMonthStr = `${nextMonthYear}-${nextMonth.toString().padStart(2, "0")}`

    return creditCards
      .filter((card) => !card.isPaused)
      .map((card) => {
        // Calculate this month's closing and due dates
        const closingDateThisMonth = new Date(year, month - 1, card.closingDay)
        const dueDateThisMonth = new Date(year, month - 1, card.dueDay)

        // If closing day has passed, the next closing is next month
        if (closingDateThisMonth < today) {
          closingDateThisMonth.setMonth(closingDateThisMonth.getMonth() + 1)
        }

        // If due day has passed, the next due date is next month
        if (dueDateThisMonth < today) {
          dueDateThisMonth.setMonth(dueDateThisMonth.getMonth() + 1)
        }

        // Calculate next month's closing and due dates
        const closingDateNextMonth = new Date(nextMonthYear, nextMonth - 1, card.closingDay)
        if (card.closingDay > card.dueDay) {
          nextMonth++
          if (nextMonth > 12) {
            nextMonth = 1
            nextMonthYear++
          }
        }
        const dueDateNextMonth = new Date(nextMonthYear, nextMonth - 1, card.dueDay)

        // Calculate expenses for this card this month
        const thisMonthExpenses = creditCardExpensesThisMonth.filter((expense) => expense.creditCardId === card.id)

        // Calculate pending expenses for this card (from all months, not just current month)
        const pendingExpenses = expenses.filter(
          (expense) =>
            expense.creditCardId === card.id && expense.executionDate && expense.executionDate > currentDateStr,
        )
        const pendingTotal = pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0)

        // Calculate expenses for this card next month
        const nextMonthExpenses = expenses.filter(
          (expense) =>
            expense.creditCardId === card.id && expense.executionDate && expense.executionDate.startsWith(nextMonthStr),
        )

        return {
          card,
          thisMonthTotal: thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
          thisMonthClosingDate: closingDateThisMonth,
          thisMonthDueDate: dueDateThisMonth,
          nextMonthTotal: nextMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
          nextMonthClosingDate: closingDateNextMonth,
          nextMonthDueDate: dueDateNextMonth,
          pendingTotal: pendingTotal,
        }
      })
  }, [creditCards, expenses, selectedMonth, creditCardExpensesThisMonth, today, currentDateStr])

  // Calculate income up to today and pending income
  const { executedIncome, pendingIncome } = useMemo(() => {
    const executed = monthlyIncomes
      .filter((income) => income.date <= currentDateStr)
      .reduce((sum, income) => sum + income.amount, 0)

    const pending = monthlyIncomes
      .filter((income) => income.date > currentDateStr)
      .reduce((sum, income) => sum + income.amount, 0)

    return { executedIncome: executed, pendingIncome: pending }
  }, [monthlyIncomes, currentDateStr])

  // Use adjusted expenses for the total
  const totalExpenses = useMemo(() => {
    return adjustedMonthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }, [adjustedMonthlyExpenses])

  // Calculate total expenses including pending credit card expenses
  const totalExpensesEndOfMonth = useMemo(() => {
    return monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }, [monthlyExpenses])

  const totalBudgeted = useMemo(() => {
    return categories
      .filter((category) => category.name !== "Others") // Exclude the "Others" category
      .reduce((sum, category) => sum + (category.budget || 0), 0)
  }, [categories])

  const monthlySavings = executedIncome - totalExpenses
  const monthlySavingsEndOfMonth = executedIncome + pendingIncome - totalExpensesEndOfMonth

  // Calculate historical savings (cumulative sum of monthly savings)
  const historicalSavings = useMemo(() => {
    // Group expenses by month and year
    const expensesByMonth: Record<string, number> = {}

    // Only include expenses up to the current day
    expenses.forEach((expense) => {
      // For credit card expenses, use execution date if available
      const dateToUse = expense.executionDate || expense.date

      // Skip future expenses
      if (dateToUse > currentDateStr) return

      const date = new Date(dateToUse)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const yearMonth = `${year}-${month.toString().padStart(2, "0")}`

      expensesByMonth[yearMonth] = (expensesByMonth[yearMonth] || 0) + expense.amount
    })

    // Group incomes by month and year
    const incomesByMonth: Record<string, number> = {}
    incomes.forEach((income) => {
      // Skip future incomes
      if (income.date > currentDateStr) return

      const date = new Date(income.date)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const yearMonth = `${year}-${month.toString().padStart(2, "0")}`

      incomesByMonth[yearMonth] = (incomesByMonth[yearMonth] || 0) + income.amount
    })

    // Calculate savings by month
    let cumulativeSavings = 0
    const months = new Set([...Object.keys(expensesByMonth), ...Object.keys(incomesByMonth)])
    const sortedMonths = Array.from(months).sort()

    sortedMonths.forEach((month) => {
      const monthlyIncome = incomesByMonth[month] || 0
      const monthlyExpense = expensesByMonth[month] || 0
      cumulativeSavings += monthlyIncome - monthlyExpense
    })

    return cumulativeSavings
  }, [expenses, incomes, currentDateStr])

  // Calculate end of month savings projection
  const endOfMonthSavings = useMemo(() => {
    // Start with current historical savings
    const totalSavings = historicalSavings

    // Add pending income for the current month
    const pendingIncome = monthlyIncomes
      .filter((income) => income.date > currentDateStr)
      .reduce((sum, income) => sum + income.amount, 0)

    // Add pending expenses for the current month
    const pendingExpenses = pendingCreditCardExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    // Calculate projected end of month savings
    return totalSavings + pendingIncome - pendingExpenses
  }, [historicalSavings, monthlyIncomes, pendingCreditCardExpenses, currentDateStr])

  // Group expenses by category for the current month
  const expensesByCategory = useMemo(() => {
    const result: Record<string, Expense[]> = {}

    // Initialize with empty arrays for all categories
    categories.forEach((category) => {
      result[category.id] = []
    })

    // Add expenses to their respective categories
    monthlyExpenses.forEach((expense) => {
      if (result[expense.categoryId]) {
        result[expense.categoryId].push(expense)
      }
    })

    return result
  }, [monthlyExpenses, categories])

  // Calculate total credit card expenses for this month
  const totalCreditCardExpensesThisMonth = useMemo(() => {
    return creditCardExpensesThisMonth.reduce((sum, expense) => sum + expense.amount, 0)
  }, [creditCardExpensesThisMonth])

  // Calculate total executed credit card expenses
  const totalExecutedCreditCardExpenses = useMemo(() => {
    return executedCreditCardExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }, [executedCreditCardExpenses])

  // Calculate total pending credit card expenses
  const totalPendingCreditCardExpenses = useMemo(() => {
    return pendingCreditCardExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }, [pendingCreditCardExpenses])

  // Format date as DD/MM
  const formatShortDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    return `${day}/${month}`
  }

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <div className="container mx-auto p-4 space-y-6 pb-20">
      {/* Replace the existing h1 heading with a flex container that includes the month selector */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
          <h1 className="text-2xl font-bold text-foreground">{t.dashboard.title}</h1>
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <ScrollableSelect
          value={selectedMonth}
          onValueChange={setSelectedMonth}
          options={allOptions}
          currentOption={currentOption}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.income}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <ArrowDownIcon className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{formatCurrency(executedIncome)}</span>
            </div>
            {pendingIncome > 0 && (
              <div className="text-xs text-muted-foreground text-right mt-1">
                {formatCurrency(pendingIncome)} {t.dashboard.creditCard.pendingSmall}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.expenses.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <ArrowUpIcon className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="text-xs text-muted-foreground text-right mt-1">{t.dashboard.expenses.note}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.budgeted}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <BarChart3Icon className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.monthlySavings.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <WalletIcon className="h-5 w-5 text-purple-500" />
              <span className={`text-2xl font-bold ${monthlySavings >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(monthlySavings)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground text-right mt-1">
              {t.dashboard.monthlySavings.note} {formatCurrency(monthlySavingsEndOfMonth)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.currentSavings.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <PiggyBankIcon className="h-6 w-6 text-amber-500" />
              <span className={`text-2xl font-bold ${historicalSavings >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(historicalSavings)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground text-right mt-1">{t.dashboard.monthlySavings.note}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.endOfMonthProjection.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <CalendarIcon className="h-6 w-6 text-indigo-500" />
              <span className={`text-2xl font-bold ${endOfMonthSavings >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(endOfMonthSavings)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground text-right mt-1">{t.dashboard.monthlySavings.note}</div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Card Expenses KPIs */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium">{t.dashboard.creditCard.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground text-right">{t.dashboard.creditCard.total}</div>
              <div className="text-xl font-bold text-right">{formatCurrency(totalCreditCardExpensesThisMonth)}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground text-right">{t.dashboard.creditCard.executed}</div>
              <div className="text-xl font-bold text-green-500 text-right">
                {formatCurrency(totalExecutedCreditCardExpenses)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground text-right">{t.dashboard.creditCard.pending}</div>
              <div className="text-xl font-bold text-amber-500 text-right">
                {formatCurrency(totalPendingCreditCardExpenses)}
              </div>
            </div>
          </div>

          {totalPendingCreditCardExpenses > 0 && (
            <div className="text-xs text-muted-foreground flex items-center">
              <AlertCircleIcon className="h-3 w-3 mr-1 text-amber-500" />
              {t.dashboard.creditCard.pendingWarning}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Cards Metrics */}
      {creditCardMetrics.length > 0 && (
        <Collapsible open={creditCardsExpanded} onOpenChange={setCreditCardsExpanded} className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{t.dashboard.creditCard.cards}</h2>
            <div>
              <CollapsibleTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${creditCardsExpanded ? "rotate-180" : ""}`}
                />
                <span className="sr-only">{t.dashboard.creditCard.toggle}</span>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent className="transition-all">
            <div className="w-full overflow-x-auto snap-x snap-mandatory pb-4 pt-2">
              <div className="flex space-x-4">
                {creditCardMetrics.map((metric) => (
                  <Card
                    key={metric.card.id}
                    className="min-w-[80%] sm:min-w-[calc(50%-0.5rem)] w-[80%] sm:w-[calc(50%-0.5rem)] flex-shrink-0 snap-center"
                  >
                    <CardHeader className="p-3 pb-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCardIcon className="h-4 w-4 mr-2 text-blue-500" />
                          <CardTitle className="text-base font-medium">{metric.card.description}</CardTitle>
                        </div>
                        {metric.pendingTotal > 0 && (
                          <div className="text-xs font-medium text-amber-500">
                            {formatCurrency(metric.pendingTotal)} {t.dashboard.creditCard.pendingSmall}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-[2px]">
                      {/* Current Period Section */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">{t.dashboard.creditCard.totalLabel}</div>
                          <div className="text-lg font-bold">{formatCurrency(metric.thisMonthTotal)}</div>
                        </div>
                        <div className="flex text-xs space-x-4 justify-end">
                          <div>
                            <span className="text-muted-foreground">{t.dashboard.creditCard.closing} </span>
                            <span className="font-medium">{formatShortDate(metric.thisMonthClosingDate)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground ml-2">{t.dashboard.creditCard.due} </span>
                            <span className="font-medium">{formatShortDate(metric.thisMonthDueDate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Upcoming Period Section */}
                      <div className="space-y-1">
                        <div className="text-xs font-medium">{t.dashboard.creditCard.upcoming}</div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-muted-foreground">{t.dashboard.creditCard.totalLabel}</div>
                          <div className="text-sm font-semibold">{formatCurrency(metric.nextMonthTotal)}</div>
                        </div>
                        <div className="flex text-xs space-x-4 justify-end">
                          <div>
                            <span className="text-muted-foreground">{t.dashboard.creditCard.closing} </span>
                            <span className="font-medium">{formatShortDate(metric.nextMonthClosingDate)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground ml-2">{t.dashboard.creditCard.due} </span>
                            <span className="font-medium">{formatShortDate(metric.nextMonthDueDate)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold mt-1 text-foreground">{t.dashboard.categories.title}</h2>
          <Select defaultValue="chronological" onValueChange={setCategorySorting}>
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
              categoryExpenses.forEach(cat => {
              console.log("cat date, ",cat.categoryId,cat.date)
              } )
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
            const totalPercentage = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0

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
                        onClick={(e) => e.stopPropagation()} // Add this line to stop propagation
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
            const totalPercentage = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0

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
                      <div
                        className="mt-1 pt-3 border-t border-border"
                        onClick={(e) => e.stopPropagation()} // Add this line to stop propagation
                      >
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
