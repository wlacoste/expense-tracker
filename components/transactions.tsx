"use client"

import { useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TransactionsExpensesTab from "@/components/transactions-expenses-tab"
import TransactionsIncomeTab from "@/components/transactions-income-tab"
import TransactionsCategoriesTab from "@/components/transactions-categories-tab"
import TransactionsCreditCardsTab from "@/components/transactions-credit-cards-tab"
import TransactionsReservesTab from "@/components/transactions-reserves-tab"
import { getMonthlyExpenses, getMonthlyIncomes, generateMonthOptions } from "@/lib/utils"
import { ScrollableSelect } from "./scrollable-select"

interface TransactionsProps {
  expenses: any[]
  incomes: any[]
  categories: any[]
  creditCards: any[]
  reserves: any[] // Add this line
  selectedMonth: string
  setSelectedMonth: (month: string) => void
  onUpdateExpense: (expense: any) => void
  onDeleteExpense: (id: string) => void
  onDeleteMultipleExpenses: (ids: string[]) => void
  onAddCategory: () => void
  onAddCreditCard: () => void
  onAddReserve: () => void // Add this line
  onUpdateIncome: (income: any) => void
  onDeleteIncome: (id: string) => void
  onUpdateCategory: (category: any) => void
  onDeleteCategory: (id: string) => void
  onUpdateCreditCard: (creditCard: any) => void
  onDeleteCreditCard: (id: string) => void
  onUpdateReserve: (reserve: any) => void // Add this line
  onDeleteReserve: (id: string) => void // Add this line
  language: string
  favoriteCreditCardId?: string
  onToggleFavoriteCreditCard: (id: string) => void
}

export default function Transactions({
  expenses,
  incomes,
  categories,
  creditCards,
  reserves, // Add this line
  selectedMonth,
  setSelectedMonth,
  onUpdateExpense,
  onDeleteExpense,
  onDeleteMultipleExpenses,
  onAddCategory,
  onAddCreditCard,
  onAddReserve, // Add this line
  onUpdateIncome,
  onDeleteIncome,
  onUpdateCategory,
  onDeleteCategory,
  onUpdateCreditCard,
  onDeleteCreditCard,
  onUpdateReserve, // Add this line
  onDeleteReserve, // Add this line
  language,
  favoriteCreditCardId,
  onToggleFavoriteCreditCard,
}: TransactionsProps) {
  const [activeTab, setActiveTab] = useState("expenses")

  // Get monthly expenses and incomes
  const monthlyExpenses = getMonthlyExpenses(expenses, selectedMonth)
  const monthlyIncomes = getMonthlyIncomes(incomes, selectedMonth)
  // Combine all options for the ScrollableSelect
  const { pastOptions, currentOption, futureOptions } = useMemo(
    () => generateMonthOptions(expenses, incomes),
    [expenses, incomes],
  )

  // Combine all options for the ScrollableSelect
  const allOptions = useMemo(() => {
    return [...pastOptions, currentOption, ...futureOptions]
  }, [pastOptions, currentOption, futureOptions])
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="credit-cards">Credit Cards</TabsTrigger>
          <TabsTrigger value="reserves">Reserves</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="mt-0">
          <TransactionsExpensesTab
            expenses={monthlyExpenses}
            categories={categories}
            creditCards={creditCards}
            onUpdateExpense={onUpdateExpense}
            onDeleteExpense={onDeleteExpense}
            onDeleteMultipleExpenses={onDeleteMultipleExpenses}
          />
        </TabsContent>

        <TabsContent value="income" className="mt-0">
          <TransactionsIncomeTab
            incomes={monthlyIncomes}
            onUpdateIncome={onUpdateIncome}
            onDeleteIncome={onDeleteIncome}
          />
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          <TransactionsCategoriesTab
            categories={categories}
            expenses={expenses}
            onUpdateCategory={onUpdateCategory}
            onDeleteCategory={onDeleteCategory}
            onAddCategory={onAddCategory}
          />
        </TabsContent>

        <TabsContent value="credit-cards" className="mt-0">
          <TransactionsCreditCardsTab
            creditCards={creditCards}
            expenses={expenses}
            onUpdateCreditCard={onUpdateCreditCard}
            onDeleteCreditCard={onDeleteCreditCard}
            onAddCreditCard={onAddCreditCard}
            favoriteCreditCardId={favoriteCreditCardId}
            onToggleFavoriteCreditCard={onToggleFavoriteCreditCard}
          />
        </TabsContent>
        <TabsContent value="reserves" className="mt-0">
          <TransactionsReservesTab
            reserves={reserves}
            onUpdateReserve={onUpdateReserve}
            onDeleteReserve={onDeleteReserve}
            onAddReserve={onAddReserve}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
