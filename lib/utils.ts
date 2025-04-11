import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString?: string): string {
  if (!dateString) return ""

  const [year, month, day] = dateString.split("-").map(Number)
  const localDate = new Date(year, month - 1, day) // month is 0-indexed

  return localDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

interface Expense {
  id: string
  date: string
  amount: number
  description: string
  executionDate?: string
}

interface Income {
  id: string
  date: string
  amount: number
  description: string
}

/**
 * Gets expenses for a specific month and year, using executionDate for credit card expenses
 * @param expenses Array of expenses
 * @param yearMonth String in format "YYYY-MM"
 * @returns Filtered expenses for the specified month and year
 */
export function getMonthlyExpenses(expenses: Expense[], yearMonth: string): Expense[] {
  // Ensure we're filtering by both year and month
  const [year, month] = yearMonth.split("-")

  return expenses.filter((expense) => {
    // If the expense has an executionDate (credit card expense), use that for filtering
    const dateToUse = expense.executionDate || expense.date
    const expenseDate = parseLocalDate(dateToUse)
    const expenseYear = expenseDate.getFullYear().toString()
    // getMonth() is zero-based, so January is 0, February is 1, etc.
    const expenseMonth = (expenseDate.getMonth() + 1).toString().padStart(2, "0")

    return expenseYear === year && expenseMonth === month
  })
}

/**
 * Gets incomes for a specific month and year
 * @param incomes Array of incomes
 * @param yearMonth String in format "YYYY-MM"
 * @returns Filtered incomes for the specified month and year
 */
export function getMonthlyIncomes(incomes: Income[], yearMonth: string): Income[] {
  // Ensure we're filtering by both year and month
  const [year, month] = yearMonth.split("-")

  return incomes.filter((income) => {
    const incomeDate = parseLocalDate(income.date)
    const incomeYear = incomeDate.getFullYear().toString()
    // getMonth() is zero-based, so January is 0, February is 1, etc.
    const incomeMonth = (incomeDate.getMonth() + 1).toString().padStart(2, "0")

    return incomeYear === year && incomeMonth === month
  })
}

const parseLocalDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day) // Month is 0-indexed
}

// Update the calculateExecutionDate function to handle both Date objects and strings
export function calculateExecutionDate(today: string | Date, closingDay: number, dueDay: number): Date {
  // Convert today to a string if it's a Date object
  const todayStr =
    today instanceof Date
      ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
      : today
  const currentDay = Number.parseInt(todayStr.split("-")[2], 10)
  const currentMonth = Number.parseInt(todayStr.split("-")[1], 10) - 1
  let executionYear = Number.parseInt(todayStr.split("-")[0], 10)

  let executionMonth = currentDay > dueDay ? currentMonth + 1 : currentMonth
  if (executionMonth > 11) {
    executionMonth = 0
    executionYear += 1
  }

  if (currentDay > closingDay) {
    // move to next month
    executionMonth += 1
    if (executionMonth > 11) {
      executionMonth = 0
      executionYear += 1
    }
  }

  // Note: dueDay might not exist in all months (e.g., Feb 30). Clamp it.
  const daysInMonth = new Date(executionYear, executionMonth + 1, 0).getDate()
  const clampedDueDay = Math.min(dueDay, daysInMonth)

  const nuevaFecha = new Date(Date.UTC(executionYear, executionMonth, clampedDueDay))
  return nuevaFecha
}

export function getTodayDate() {
  const today = new Date()
  const year = today.getUTCFullYear()
  const month = String(today.getUTCMonth() + 1).padStart(2, "0") // Month is 0-indexed
  const day = String(today.getUTCDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function getFormattedDate(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0") // Month is 0-indexed
  const day = String(date.getUTCDate()).padStart(2, "0")

  const fecha = `${year}-${month}-${day}`
  return fecha
}

// Update the generateMonthOptions function to reverse the order of past months
export function generateMonthOptions(expenses: Expense[] = [], incomes: Income[] = []) {
  // Get current month and year
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1 // JavaScript months are 0-indexed
  const currentYearMonth = `${currentYear}-${currentMonth.toString().padStart(2, "0")}`

  // Create sets for past and future months
  const pastMonths = new Set<string>()
  const futureMonths = new Set<string>()

  // Add 12 months into the past
  for (let i = 1; i <= 12; i++) {
    let year = currentYear
    let month = currentMonth - i

    // Adjust year if month is out of range
    while (month < 1) {
      year--
      month += 12
    }

    const yearMonth = `${year}-${month.toString().padStart(2, "0")}`
    pastMonths.add(yearMonth)
  }

  // Add 12 months into the future
  for (let i = 1; i <= 12; i++) {
    let year = currentYear
    let month = currentMonth + i

    // Adjust year if month is out of range
    while (month > 12) {
      year++
      month -= 12
    }

    const yearMonth = `${year}-${month.toString().padStart(2, "0")}`
    futureMonths.add(yearMonth)
  }

  // Add all months from expenses (including execution dates)
  expenses.forEach((expense) => {
    // Add the expense date
    const expenseDate = new Date(expense.date)
    const expenseYearMonth = `${expenseDate.getFullYear()}-${(expenseDate.getMonth() + 1).toString().padStart(2, "0")}`

    if (expenseYearMonth < currentYearMonth) {
      pastMonths.add(expenseYearMonth)
    } else if (expenseYearMonth > currentYearMonth) {
      futureMonths.add(expenseYearMonth)
    }

    // Add the execution date if it exists
    if (expense.executionDate) {
      const executionDate = new Date(expense.executionDate)
      const executionYearMonth = `${executionDate.getFullYear()}-${(executionDate.getMonth() + 1).toString().padStart(2, "0")}`

      if (executionYearMonth < currentYearMonth) {
        pastMonths.add(executionYearMonth)
      } else if (executionYearMonth > currentYearMonth) {
        futureMonths.add(executionYearMonth)
      }
    }
  })

  // Add all months from incomes
  incomes.forEach((income) => {
    const incomeDate = new Date(income.date)
    const incomeYearMonth = `${incomeDate.getFullYear()}-${(incomeDate.getMonth() + 1).toString().padStart(2, "0")}`

    if (incomeYearMonth < currentYearMonth) {
      pastMonths.add(incomeYearMonth)
    } else if (incomeYearMonth > currentYearMonth) {
      futureMonths.add(incomeYearMonth) // Fixed: add incomeYearMonth instead of futureMonths
    }
  })

  // Convert to arrays and sort
  // Sort past months in ascending order (oldest first)
  const pastMonthsArray = Array.from(pastMonths).sort()
  const futureMonthsArray = Array.from(futureMonths).sort()

  // Format for display
  const formatMonthOption = (yearMonth: string) => {
    const [year, month] = yearMonth.split("-").map(Number)
    const date = new Date(year, month - 1, 1)
    // Get month name and capitalize the first letter
    const monthName = date.toLocaleString("default", { month: "long" })
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)
    const label = `${capitalizedMonth} ${year}`
    return { value: yearMonth, label }
  }

  // Create the final options array with current month at top, past months above, future months below
  const pastOptions = pastMonthsArray.map(formatMonthOption)
  const currentOption = formatMonthOption(currentYearMonth)
  const futureOptions = futureMonthsArray.map(formatMonthOption)

  return {
    pastOptions,
    currentOption,
    futureOptions,
    currentYearMonth,
  }
}
