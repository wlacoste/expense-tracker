"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, generateMonthOptions } from "@/lib/utils"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollableSelect } from "./scrollable-select"
import { useIsMobile } from "@/hooks/use-mobile"

interface Expense {
  id: string
  amount: number
  date: string
  categoryId: string
  executionDate?: string
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
}

// Update the AnalyticsProps interface to include selectedMonth and setSelectedMonth
interface AnalyticsProps {
  expenses: Expense[]
  incomes: Income[]
  categories: Category[]
  selectedMonth: string
  setSelectedMonth: (month: string) => void
}

// Custom Legend Item component
const LegendItem = ({ color, name }: { color: string; name: string }) => (
  <div className="flex items-center mr-4">
    <div className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: color }}></div>
    <span className="text-sm">{name}</span>
  </div>
)

// Update the Analytics function to accept the new props
export default function Analytics({ expenses, incomes, categories, selectedMonth, setSelectedMonth }: AnalyticsProps) {
  const [viewType, setViewType] = useState<"monthly" | "cumulative">("monthly")
  const [timeGrouping, setTimeGrouping] = useState<"month" | "day">("month")
  const [showProjection, setShowProjection] = useState<boolean>(true)
  const isMobile = useIsMobile()

  // Generate month options
  const { pastOptions, currentOption, futureOptions, currentYearMonth } = useMemo(
    () => generateMonthOptions(expenses, incomes),
    [expenses, incomes],
  )

  // Combine all options for the ScrollableSelect
  const allOptions = useMemo(() => {
    return [...pastOptions, currentOption, ...futureOptions]
  }, [pastOptions, currentOption, futureOptions])

  // Process data for charts
  const chartData = useMemo(() => {
    // Monthly data processing
    const processMonthlyData = () => {
      // Get all months from expenses and incomes with proper year-month format
      const allDates = [...expenses.map((e) => e.date), ...incomes.map((i) => i.date)]
      const yearMonthSet = new Set(
        allDates.map((dateStr) => {
          const date = new Date(dateStr + "T00:00:00Z")
          const year = date.getFullYear()
          const month = date.getMonth() + 1
          return `${year}-${month.toString().padStart(2, "0")}`
        }),
      )

      // Sort months chronologically
      const yearMonths = Array.from(yearMonthSet).sort()

      // Get current month and year
      const today = new Date()
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth() + 1
      const currentYearMonth = `${currentYear}-${currentMonth.toString().padStart(2, "0")}`

      // Find current month's active incomes for projection
      const currentMonthIncomes = incomes.filter((income) => {
        if (income.isPaused) return false
        const incomeDate = new Date(income.date + "T00:00:00Z")
        const incomeYear = incomeDate.getFullYear()
        const incomeMonth = incomeDate.getMonth() + 1
        return `${incomeYear}-${incomeMonth.toString().padStart(2, "0")}` === currentYearMonth
      })

      const currentMonthTotalIncome = currentMonthIncomes.reduce((sum, income) => sum + income.amount, 0)

      // Calculate monthly data
      const monthlyData = yearMonths.map((yearMonth) => {
        const [year, month] = yearMonth.split("-")

        // Filter expenses and incomes for this specific year and month
        const monthExpenses = expenses.filter((e) => {
          const date = new Date(e.date)
          return date.getFullYear().toString() === year && (date.getMonth() + 1).toString().padStart(2, "0") === month
        })

        const monthIncomes = incomes.filter((i) => {
          const date = new Date(i.date)
          return date.getFullYear().toString() === year && (date.getMonth() + 1).toString().padStart(2, "0") === month
        })

        // Calculate totals
        const totalExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
        const totalIncome = monthIncomes.filter((i) => !i.isPaused).reduce((sum, i) => sum + i.amount, 0)
        const savings = totalIncome - totalExpense

        // Format month for display (e.g., "2023-01" to "Jan '23")
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const monthIndex = Number.parseInt(month, 10) - 1 // Convert to 0-based index
        const shortYear = year.slice(-2) // Get last two digits of year
        const formattedMonth = `${monthNames[monthIndex]} '${shortYear}`

        return {
          month: formattedMonth,
          rawMonth: yearMonth,
          expenses: totalExpense,
          income: totalIncome,
          savings,
          isProjected: false,
        }
      })

      // Add projected months (12 months into the future)
      if (showProjection && currentMonthTotalIncome > 0) {
        const lastDataMonth = yearMonths.length > 0 ? yearMonths[yearMonths.length - 1] : currentYearMonth
        const [lastYear, lastMonth] = lastDataMonth.split("-").map(Number)

        for (let i = 1; i <= 12; i++) {
          let projYear = lastYear
          let projMonth = lastMonth + i

          // Adjust year if month is out of range
          while (projMonth > 12) {
            projYear++
            projMonth -= 12
          }

          const projYearMonth = `${projYear}-${projMonth.toString().padStart(2, "0")}`

          // Skip if this month already exists in the data
          if (yearMonths.includes(projYearMonth)) continue

          // Format month for display
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
          const projMonthIndex = projMonth - 1 // Convert to 0-based index
          const projShortYear = projYear.toString().slice(-2) // Get last two digits of year
          const formattedMonth = `${monthNames[projMonthIndex]} '${projShortYear}`

          monthlyData.push({
            month: formattedMonth,
            rawMonth: projYearMonth,
            expenses: 0, // No projected expenses
            income: currentMonthTotalIncome, // Project current month's income
            savings: currentMonthTotalIncome, // Savings = income since no expenses
            isProjected: true,
          })
        }

        // Sort the data again to ensure chronological order
        monthlyData.sort((a, b) => a.rawMonth.localeCompare(b.rawMonth))
      }

      return monthlyData
    }

    // Daily data processing
    const processDailyData = () => {
      // Get all unique dates from expenses and incomes
      const allDates = [...expenses.map((e) => e.date), ...incomes.map((i) => i.date)]
      const uniqueDates = Array.from(new Set(allDates)).sort()

      // Calculate daily data
      const dailyData = uniqueDates.map((dateStr) => {
        // Filter expenses and incomes for this specific date
        const dayExpenses = expenses.filter((e) => e.date === dateStr)
        const dayIncomes = incomes.filter((i) => i.date === dateStr)

        // Calculate totals
        const totalExpense = dayExpenses.reduce((sum, e) => sum + e.amount, 0)
        const totalIncome = dayIncomes.filter((i) => !i.isPaused).reduce((sum, i) => sum + i.amount, 0)
        const savings = totalIncome - totalExpense

        // Format date for display (e.g., "2023-01-15" to "Jan 15")
        const [yearStr, monthStr, dayStr] = dateStr.split("-")
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const monthIndex = Number.parseInt(monthStr, 10) - 1
        const day = Number.parseInt(dayStr, 10)
        const formattedDate = `${monthNames[monthIndex]} ${day}`

        return {
          month: formattedDate, // Using "month" key for consistency with chart
          rawMonth: dateStr,
          expenses: totalExpense,
          income: totalIncome,
          savings,
          isProjected: false,
        }
      })

      return dailyData
    }

    // Get the appropriate data based on the timeGrouping
    const timeData = timeGrouping === "month" ? processMonthlyData() : processDailyData()

    // Calculate cumulative data
    let cumulativeExpenses = 0
    let cumulativeIncome = 0
    let cumulativeSavings = 0

    const cumulativeData = timeData.map((data) => {
      cumulativeExpenses += data.expenses
      cumulativeIncome += data.income
      cumulativeSavings += data.savings

      return {
        ...data,
        expenses: cumulativeExpenses,
        income: cumulativeIncome,
        savings: cumulativeSavings,
      }
    })

    // Find the index where projection starts
    const projectionStartIndex = timeData.findIndex((data) => data.isProjected)

    // Calculate expenses by category with category colors
    const categoryMap = new Map(categories.map((category) => [category.id, category]))
    const expensesByCategory: Array<{ name: string; amount: number; color: string }> = []

    // Group expenses by category
    const expenseSumByCategory: Record<string, number> = {}
    expenses.forEach((expense) => {
      if (expense.categoryId) {
        expenseSumByCategory[expense.categoryId] = (expenseSumByCategory[expense.categoryId] || 0) + expense.amount
      }
    })

    // Create data array with category name, amount, and color
    Object.entries(expenseSumByCategory).forEach(([categoryId, amount]) => {
      const category = categoryMap.get(categoryId)
      if (category) {
        expensesByCategory.push({
          name: category.name,
          amount,
          color: category.color,
        })
      }
    })

    // Sort categories by expense amount (descending)
    expensesByCategory.sort((a, b) => b.amount - a.amount)

    return {
      monthly: timeData,
      cumulative: cumulativeData,
      categories: expensesByCategory,
      projectionStartIndex: projectionStartIndex >= 0 ? projectionStartIndex : null,
    }
  }, [expenses, incomes, categories, timeGrouping, showProjection])

  const currentData = viewType === "monthly" ? chartData.monthly : chartData.cumulative

  // For mobile view, limit the data to the most recent 6 months
  const visibleData = useMemo(() => {
    // Show all data for both mobile and desktop
    return currentData
  }, [currentData])

  // Calculate chart width for mobile scrolling
  const chartWidth = useMemo(() => {
    if (!isMobile) return "100%"
    // On mobile, make 6 months occupy 100% width (each month is wider)
    // This ensures good visibility while requiring scrolling for more months
    const monthWidth = 100 / 6 // percentage of viewport width per month
    return `${Math.max(currentData.length * monthWidth, 100)}%`
  }, [currentData.length, isMobile])

  // Custom tooltip formatter for the charts
  const formatTooltipValue = (value: number) => {
    return formatCurrency(value)
  }

  // Custom tooltip formatter that includes projected status
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="bg-background border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          {dataPoint.isProjected && <p className="text-xs text-muted-foreground mt-1 italic">Projected data</p>}
        </div>
      )
    }
    return null
  }

  // Define legend items
  const legendItems = [
    { name: "Income", color: "#10b981" },
    { name: "Expenses", color: "#ef4444" },
    { name: "Savings", color: "#8b5cf6" },
  ]

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>

        <ScrollableSelect
          value={selectedMonth}
          onValueChange={setSelectedMonth}
          options={allOptions}
          currentOption={currentOption}
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs value={viewType} onValueChange={(v) => setViewType(v as "monthly" | "cumulative")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="cumulative">Cumulative</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={timeGrouping} onValueChange={(v) => setTimeGrouping(v as "month" | "day")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Group by Month</SelectItem>
              <SelectItem value="day">Group by Day</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Switch id="show-projection" checked={showProjection} onCheckedChange={setShowProjection} />
            <Label htmlFor="show-projection">Show Future Projection</Label>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className={`flex ${isMobile ? "flex-col items-start" : "flex-row items-center justify-between"}`}>
          <CardTitle>Financial Overview {timeGrouping === "day" ? "(Daily)" : "(Monthly)"}</CardTitle>
          {/* Custom Legend - Responsive positioning */}
          <div className={`flex flex-wrap ${isMobile ? "mt-1" : "justify-end"}`}>
            {legendItems.map((item, index) => (
              <LegendItem key={index} color={item.color} name={item.name} />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] overflow-x-auto">
            <div style={{ width: chartWidth, height: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visibleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="2 4" strokeWidth={0.5} />
                  <XAxis
                    dataKey="month"
                    angle={timeGrouping === "day" ? -45 : 0}
                    textAnchor={timeGrouping === "day" ? "end" : "middle"}
                    height={timeGrouping === "day" ? 80 : 30}
                  />
                  <YAxis />
                  <RechartsTooltip wrapperStyle={{  color:'#000', borderRadius: 3, }} />
                  {/* Income Area with solid color */}
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    strokeDasharray={(datum) => (datum.isProjected ? "3 3" : "0")}
                  />

                  {/* Expenses Area with solid color */}
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    strokeDasharray={(datum) => (datum.isProjected ? "3 3" : "0")}
                  />

                  {/* Savings Area with solid color */}
                  <Area
                    type="monotone"
                    dataKey="savings"
                    name="Savings"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    strokeDasharray={(datum) => (datum.isProjected ? "3 3" : "0")}
                  />

                  {chartData.projectionStartIndex !== null && (
                    <ReferenceLine
                      x={currentData[chartData.projectionStartIndex]?.month}
                      stroke="#9ca3af"
                      strokeDasharray="2 3"
                      strokeWidth={0.8}
                      label={{ value: "Projection Start", position: "top", fill: "#9ca3af", fontSize: 12 }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.categories} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="2 4" strokeWidth={0.5} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip wrapperStyle={{  color:'#000', borderRadius: 3, }} />
                <Bar dataKey="amount" name="Amount">
                  {chartData.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
