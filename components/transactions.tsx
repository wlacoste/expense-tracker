"use client"

import { useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMonthlyExpenses, getMonthlyIncomes, generateMonthOptions } from "@/lib/utils"
import { ScrollableSelect } from "./scrollable-select"
import TransactionsExpensesTab from "./transactions-expenses-tab"
import TransactionsIncomeTab from "./transactions-income-tab"
import TransactionsCategoriesTab from "./transactions-categories-tab"
import TransactionsCreditCardsTab from "./transactions-credit-cards-tab"

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
  onDeleteMultipleExpenses?: (ids: string[]) => void
  onUpdateIncome: (income: Income) => void
  onDeleteIncome: (id: string) => void
  onUpdateCategory: (category: Category) => void
  onDeleteCategory: (id: string) => void
  onUpdateCreditCard: (creditCard: CreditCard) => void
  onDeleteCreditCard: (id: string) => void
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
  onDeleteMultipleExpenses,
  onAddCategory,
  onAddCreditCard,
  onUpdateIncome,
  onDeleteIncome,
  onUpdateCategory,
  onDeleteCategory,
  onUpdateCreditCard,
  onDeleteCreditCard,
}: TransactionsProps) {
  // Generate month options
  const { pastOptions, currentOption, futureOptions } = useMemo(
    () => generateMonthOptions(expenses, incomes),
    [expenses, incomes],
  )

  // Combine all options for the ScrollableSelect
  const allOptions = useMemo(() => {
    return [...pastOptions, currentOption, ...futureOptions]
  }, [pastOptions, currentOption, futureOptions])

  const monthlyExpenses = useMemo(() => getMonthlyExpenses(expenses, selectedMonth), [expenses, selectedMonth])
  const monthlyIncomes = useMemo(() => getMonthlyIncomes(incomes, selectedMonth), [incomes, selectedMonth])

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
          <TransactionsExpensesTab
            expenses={monthlyExpenses}
            categories={categories}
            creditCards={creditCards}
            onUpdateExpense={onUpdateExpense}
            onDeleteExpense={onDeleteExpense}
            onDeleteMultipleExpenses={onDeleteMultipleExpenses}
          />
        </TabsContent>

        <TabsContent value="income" className="space-y-4 mt-4">
          <TransactionsIncomeTab
            incomes={monthlyIncomes}
            onUpdateIncome={onUpdateIncome}
            onDeleteIncome={onDeleteIncome}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 mt-4">
          <TransactionsCategoriesTab
            categories={categories}
            expenses={expenses}
            onUpdateCategory={onUpdateCategory}
            onDeleteCategory={onDeleteCategory}
            onAddCategory={onAddCategory}
          />
        </TabsContent>

        <TabsContent value="creditcards" className="space-y-4 mt-4">
          <TransactionsCreditCardsTab
            creditCards={creditCards}
            expenses={expenses}
            onUpdateCreditCard={onUpdateCreditCard}
            onDeleteCreditCard={onDeleteCreditCard}
            onAddCreditCard={onAddCreditCard}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
