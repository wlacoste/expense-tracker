"use client"

import { ScrollableSelect } from "../scrollable-select"
import type { DashboardProps } from "./types"
import { useDashboard } from "./useDashboard"
import { SummaryCards } from "./SummaryCards"
import { CreditCardSection } from "./CreditCardSection"
import { CategorySection } from "./CategorySection"
import { calculateInterestEarned, calculateTotalInterest, formatCurrency, formatDate } from "@/lib/utils"

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
  categorySorting,
  setCategorySorting,
  reserves,
}: DashboardProps) {
  const {
    t,
    allOptions,
    currentOption,
    currentDateStr,
    monthlyExpenses,
    creditCardMetrics,
    executedIncome,
    pendingIncome,
    totalExpenses,
    totalBudgeted,
    monthlySavings,
    monthlySavingsEndOfMonth,
    historicalSavings,
    endOfMonthSavings,
    totalCreditCardExpensesThisMonth,
    totalExecutedCreditCardExpenses,
    totalPendingCreditCardExpenses,
    creditCardsExpanded,
    setCreditCardsExpanded,
    expandedCategories,
    toggleCategoryExpansion,
    locale,
  } = useDashboard(
    expenses,
    incomes,
    categories,
    creditCards,
    selectedMonth,
    language,
    categorySorting,
    setCategorySorting,
  )

    const totalReserves = reserves.reduce((sum, reserve) => sum + reserve.amount, 0)
  const totalReservesWithInterest = reserves.reduce((sum, reserve) => {
    const interestGenerated = calculateInterestEarned(reserve)
    return sum + reserve.amount + interestGenerated
  }, 0)

  return (
    <div className="container mx-auto p-4 space-y-6 pb-20">
      {/* Header with month selector */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
          <h1 className="text-2xl font-bold text-foreground">{t.dashboard.title}</h1>

          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(locale, {
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

      {/* Summary Cards */}
      <SummaryCards
        executedIncome={executedIncome}
        pendingIncome={pendingIncome}
        totalExpenses={totalExpenses}
        totalBudgeted={totalBudgeted}
        monthlySavings={monthlySavings}
        monthlySavingsEndOfMonth={monthlySavingsEndOfMonth}
        historicalSavings={historicalSavings}
        endOfMonthSavings={endOfMonthSavings}
        totalReserves={totalReserves}
        totalReservesWithInterest={totalReservesWithInterest}
        t={t}
      />

      {/* Credit Card Section */}
      <CreditCardSection
        creditCardMetrics={creditCardMetrics}
        creditCardsExpanded={creditCardsExpanded}
        setCreditCardsExpanded={setCreditCardsExpanded}
        totalCreditCardExpensesThisMonth={totalCreditCardExpensesThisMonth}
        totalExecutedCreditCardExpenses={totalExecutedCreditCardExpenses}
        totalPendingCreditCardExpenses={totalPendingCreditCardExpenses}
        t={t}
      />

      {/* Categories Section */}
      <CategorySection
        categories={categories}
        monthlyExpenses={monthlyExpenses}
        currentDateStr={currentDateStr}
        expandedCategories={expandedCategories}
        toggleCategoryExpansion={toggleCategoryExpansion}
        onAddCategory={onAddCategory}
        onAddExpenseWithCategory={onAddExpenseWithCategory}
        categorySorting={categorySorting}
        setCategorySorting={setCategorySorting}
        language={language}
        t={t}
      />
    </div>
  )
}
