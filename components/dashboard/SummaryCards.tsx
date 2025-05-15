import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { ArrowDownIcon, ArrowUpIcon, BarChart3Icon, WalletIcon, PiggyBankIcon, CalendarIcon } from "lucide-react"
import type { SummaryCardsProps } from "./types"

export function SummaryCards({
  executedIncome,
  pendingIncome,
  totalExpenses,
  totalBudgeted,
  monthlySavings,
  monthlySavingsEndOfMonth,
  historicalSavings,
  endOfMonthSavings,
  totalReserves,
  totalReservesWithInterest,
  totalExpensesUptoToday,
  t,
}: SummaryCardsProps) {
  return (
    <>
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
            <div className="text-xs text-muted-foreground text-right mt-1">{formatCurrency(totalExpensesUptoToday)}</div>
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
              <span className={`text-2xl font-bold ${historicalSavings - totalReserves >= 0 ? "text-green-500" : "text-red-500"}`}>
                { formatCurrency(historicalSavings - totalReserves)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground text-right mt-1">{"Reserved: " + formatCurrency(totalReservesWithInterest)}</div>
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
    </>
  )
}
