import type React from "react"
import { Reserve } from "../transactions-reserves-tab"

export interface Expense {
  id: string
  amount: number
  date: string
  description?: string
  categoryId: string
  creditCardId?: string
  executionDate?: string
  isPaid?: boolean
  expenseInstallmentId?: string
  installmentQuantity?: number
  installmentNumber?: number
  totalAmount?: number
  isRecurring?: boolean
}

export interface Income {
  id: string
  amount: number
  date: string
  isPaused: boolean
  description: string
}

export interface Category {
  id: string
  name: string
  color: string
  budget?: number
  orderNumber: number
  isDisabled: boolean
}

export interface CreditCard {
  id: string
  description: string
  closingDay: number
  dueDay: number
  goodThruDate: string
  isPaused: boolean
}

export interface CreditCardMetric {
  card: CreditCard
  thisMonthTotal: number
  thisMonthClosingDate: Date
  thisMonthDueDate: Date
  nextMonthTotal: number
  nextMonthClosingDate: Date
  nextMonthDueDate: Date
  pendingTotal: number
}

export interface DashboardProps {
  expenses: Expense[]
  incomes: Income[]
  categories: Category[]
  creditCards: CreditCard[]
  reserves: Reserve[]
  selectedMonth: string
  setSelectedMonth: (month: string) => void
  onAddCategory: () => void
  onAddExpenseWithCategory: (categoryId: string) => void
  language: string
  categorySorting: string
  setCategorySorting: (value: string) => void
  favoriteCreditCardId?: string
}

export interface CategorySectionProps {
  categories: Category[]
  monthlyExpenses: Expense[]
  currentDateStr: string
  expandedCategories: Record<string, boolean>
  toggleCategoryExpansion: (categoryId: string, e: React.MouseEvent) => void
  onAddCategory: () => void
  onAddExpenseWithCategory: (categoryId: string) => void
  categorySorting: string
  setCategorySorting: (value: string) => void
  language: string
  t: any
}

export interface CreditCardSectionProps {
  creditCardMetrics: CreditCardMetric[]
  creditCardsExpanded: boolean
  setCreditCardsExpanded: (expanded: boolean) => void
  totalCreditCardExpensesThisMonth: number
  totalExecutedCreditCardExpenses: number
  totalPendingCreditCardExpenses: number
  t: any
  favoriteCreditCardId?: string
}

export interface SummaryCardsProps {
  executedIncome: number
  pendingIncome: number
  totalExpenses: number
  totalBudgeted: number
  monthlySavings: number
  monthlySavingsEndOfMonth: number
  historicalSavings: number
  endOfMonthSavings: number
  t: any
  totalReserves:number
  totalReservesWithInterest:number
}
