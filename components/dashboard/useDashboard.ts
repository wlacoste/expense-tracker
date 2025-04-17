"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { getMonthlyExpenses, getMonthlyIncomes, generateMonthOptions } from "@/lib/utils"
import { getTranslations } from "@/lib/translations"
import type { Expense, Income, Category, CreditCard } from "./types"

// Map our language codes to proper locale codes
function getLocaleFromLanguage(language: string): string {
  const localeMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    // Add more languages as needed
  }
  return localeMap[language] || "en-US" // Default to en-US if language not found
}

export function useDashboard(
  expenses: Expense[],
  incomes: Income[],
  categories: Category[],
  creditCards: CreditCard[],
  selectedMonth: string,
  language: string,
  categorySorting: string,
  setCategorySorting: (value: string) => void,
) {
  const [creditCardsExpanded, setCreditCardsExpanded] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  // Remove the categorySorting state since it's now passed as a prop
  // const [categorySorting, setCategorySorting] = useState<string>("chronological")

  // Get translations
  const t = getTranslations(language as any)

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

  // Get monthly expenses and incomes
  const monthlyExpenses = useMemo(() => getMonthlyExpenses(expenses, selectedMonth), [expenses, selectedMonth])
  const monthlyIncomes = useMemo(() => getMonthlyIncomes(incomes, selectedMonth), [incomes, selectedMonth])

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
      .filter((category) => {
        // Always exclude the "Others" category
        if (category.name === "Others") return false

        // Include all enabled categories
        if (!category.isDisabled) return true

        // For disabled categories, only include them if they have expenses this month
        return monthlyExpenses.some((expense) => expense.categoryId === category.id)
      })
      .reduce((sum, category) => sum + (category.budget || 0), 0)
  }, [categories, monthlyExpenses])

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

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  return {
    t,
    allOptions,
    currentOption,
    currentDateStr,
    monthlyExpenses,
    monthlyIncomes,
    creditCardMetrics,
    executedIncome,
    pendingIncome,
    totalExpenses,
    totalBudgeted,
    monthlySavings,
    monthlySavingsEndOfMonth,
    historicalSavings,
    endOfMonthSavings,
    expensesByCategory,
    totalCreditCardExpensesThisMonth,
    totalExecutedCreditCardExpenses,
    totalPendingCreditCardExpenses,
    creditCardsExpanded,
    setCreditCardsExpanded,
    expandedCategories,
    categorySorting,
    setCategorySorting,
    toggleCategoryExpansion,
    locale: getLocaleFromLanguage(language), // Add this line
  }
}

// Helper functions
export function formatShortDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  return `${day}/${month}`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}
