interface Expense {
  id: string
  description: string
  amount: number
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
  description: string
  amount: number
  isPaused: boolean
  date: string
}

interface Category {
  id: string
  name: string
  color: string
  budget?: number
}

interface CreditCard {
  id: string
  description: string
  closingDay: number
  dueDay: number
  goodThruDate: string
  isPaused: boolean
}

interface StorageData {
  expenses: Expense[]
  incomes: Income[]
  categories: Category[]
  creditCards: CreditCard[]
  lastAccessDate?: string // Added to track the last time the app was accessed
  language?: string // Added to store the user's language preference
  categorySorting?: string // Added to store the category sorting preference
}

const STORAGE_KEY = "expense-tracker-data"

// Function to check if we're online
export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine
}

// Function to register for online/offline events
export function registerConnectivityListeners(onlineCallback: () => void, offlineCallback: () => void): () => void {
  if (typeof window === "undefined") return () => {}

  window.addEventListener("online", onlineCallback)
  window.addEventListener("offline", offlineCallback)

  // Return a cleanup function
  return () => {
    window.removeEventListener("online", onlineCallback)
    window.removeEventListener("offline", offlineCallback)
  }
}

// Safely try to register for background sync
export function tryRegisterSync() {
  // Only run this in the browser
  if (typeof window === "undefined") return

  // Check if service worker, sync manager, and navigator are available
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    // Get the service worker registration
    navigator.serviceWorker.ready
      .then((registration) => {
        // Use a short tag name to avoid length issues
        return registration.sync.register("sync-data")
      })
      .catch((err) => {
        // Just log the error but don't throw - this is non-critical functionality
        console.log("Sync registration not available:", err.message)
      })
  }
}

export function saveData(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

    // Try to register for background sync if we're online
    if (isOnline()) {
      // Use setTimeout to ensure this runs after the current execution context
      // This helps avoid issues with the service worker not being ready
      setTimeout(() => {
        tryRegisterSync()
      }, 0)
    }
  } catch (error) {
    console.error("Error saving data to localStorage:", error)
  }
}

export function loadData(): StorageData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("Error loading data from localStorage:", error)
    return null
  }
}

export function getLastAccessDate(): string | null {
  try {
    const data = loadData()
    return data?.lastAccessDate || null
  } catch (error) {
    console.error("Error getting last access date:", error)
    return null
  }
}

export function updateLastAccessDate(date: string): void {
  try {
    const data = loadData() || { expenses: [], incomes: [], categories: [], creditCards: [] }
    data.lastAccessDate = date
    saveData(data)
  } catch (error) {
    console.error("Error updating last access date:", error)
  }
}

export function copyIncomesToNewMonth(incomes: Income[], fromMonth: string, toMonth: string): Income[] {
  // Filter incomes from the previous month that aren't paused
  const previousMonthIncomes = incomes.filter((income) => income.date.startsWith(fromMonth) && !income.isPaused)

  // Create copies with updated dates for the new month
  const newIncomes = previousMonthIncomes.map((income) => {
    // Get the day part from the original date
    const day = income.date.split("-")[2]

    // Create a new date with the new month and the same day
    const newDate = `${toMonth}-${day}`

    return {
      ...income,
      id: Date.now() + Math.random().toString(36).substring(2, 9), // Generate a new unique ID
      date: newDate,
    }
  })

  return newIncomes
}

export function copyRecurringExpensesToNewMonth(expenses: Expense[], fromMonth: string, toMonth: string): Expense[] {
  // Filter recurring expenses from the previous month
  const recurringExpenses = expenses.filter(
    (expense) =>
      expense.date.startsWith(fromMonth) &&
      expense.isRecurring &&
      // Exclude installment expenses as they're handled separately
      !expense.expenseInstallmentId,
  )

  // Create copies with updated dates for the new month
  const newExpenses = recurringExpenses.map((expense) => {
    // Get the day part from the original date
    const day = expense.date.split("-")[2]

    // Create a new date with the new month and the same day
    const newDate = `${toMonth}-${day}`

    // Calculate new execution date if it exists
    let newExecutionDate = undefined
    if (expense.executionDate && expense.creditCardId) {
      const [year, month] = toMonth.split("-")
      const executionDay = expense.executionDate.split("-")[2]
      newExecutionDate = `${year}-${month}-${executionDay}`
    }

    return {
      ...expense,
      id: Date.now() + Math.random().toString(36).substring(2, 9), // Generate a new unique ID
      date: newDate,
      executionDate: newExecutionDate,
    }
  })

  return newExpenses
}

export function copyInstallmentExpensesToNewMonth(
  expenses: Expense[],
  creditCards: CreditCard[],
  fromMonth: string,
  toMonth: string,
): Expense[] {
  const newExpenses: Expense[] = []

  // Get all unique installment IDs from the previous month's first installments
  const installmentGroups = expenses.filter(
    (expense) =>
      expense.date.startsWith(fromMonth) &&
      expense.expenseInstallmentId &&
      expense.installmentNumber === 1 &&
      expense.isRecurring,
  )

  // For each installment group, create a new set of installments starting from the new month
  installmentGroups.forEach((firstInstallment) => {
    if (!firstInstallment.installmentQuantity) return

    // Generate a new installment ID for this group
    const newInstallmentId = `inst-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`

    // Get the credit card if it exists
    const creditCard = firstInstallment.creditCardId
      ? creditCards.find((card) => card.id === firstInstallment.creditCardId)
      : null

    // Get the day from the original date
    const day = firstInstallment.date.split("-")[2]

    // Create a new date with the new month and the same day
    const firstDate = `${toMonth}-${day}`

    // Calculate the first execution date if needed
    let firstExecutionDate = undefined
    if (creditCard) {
      const [year, month] = toMonth.split("-")
      const tempDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, creditCard.dueDay)
      firstExecutionDate = tempDate.toISOString().split("T")[0]
    }

    // Create the installments
    for (let i = 0; i < firstInstallment.installmentQuantity; i++) {
      // Calculate the date for this installment
      let installmentDate: string
      let installmentExecutionDate: string | undefined

      if (i === 0) {
        // First installment uses the calculated date
        installmentDate = firstDate
        installmentExecutionDate = firstExecutionDate
      } else {
        // For subsequent installments, calculate the month
        const [baseYear, baseMonth] = toMonth.split("-").map(Number)
        let installmentYear = baseYear
        let installmentMonth = baseMonth + i

        // Adjust year if month is out of range
        while (installmentMonth > 12) {
          installmentYear++
          installmentMonth -= 12
        }

        const installmentMonthStr = installmentMonth.toString().padStart(2, "0")

        // If there's a credit card, use its due day
        if (creditCard) {
          // Calculate the last day of the month to ensure due day is valid
          const lastDayOfMonth = new Date(installmentYear, installmentMonth, 0).getDate()
          const dueDayForMonth = Math.min(creditCard.dueDay, lastDayOfMonth)

          installmentDate = `${installmentYear}-${installmentMonthStr}-${dueDayForMonth.toString().padStart(2, "0")}`

          // Calculate execution date based on closing and due days
          const execDate = new Date(installmentYear, installmentMonth - 1, dueDayForMonth)
          installmentExecutionDate = execDate.toISOString().split("T")[0]
        } else {
          // Without a credit card, just use the same day of the month
          installmentDate = `${installmentYear}-${installmentMonthStr}-${day}`
        }
      }

      // Create the installment expense
      const installmentAmount =
        i === 0
          ? firstInstallment.amount // Use the same amount for the first installment
          : firstInstallment.amount // For simplicity, use the same amount for all installments

      newExpenses.push({
        id: `${newInstallmentId}-${i + 1}`,
        description: `${firstInstallment.description.split("(")[0].trim()} (${i + 1}/${firstInstallment.installmentQuantity})`,
        amount: installmentAmount,
        categoryId: firstInstallment.categoryId,
        date: installmentDate,
        creditCardId: firstInstallment.creditCardId,
        executionDate: installmentExecutionDate,
        expenseInstallmentId: newInstallmentId,
        installmentQuantity: firstInstallment.installmentQuantity,
        installmentNumber: i + 1,
        totalAmount: firstInstallment.totalAmount,
        isPaid: false,
        isRecurring: firstInstallment.isRecurring,
      })
    }
  })

  return newExpenses
}

export function isNewMonth(lastAccessDate: string | null, currentDate: string): boolean {
  if (!lastAccessDate) return false

  const lastMonth = lastAccessDate.substring(0, 7) // YYYY-MM format
  const currentMonth = currentDate.substring(0, 7)

  return lastMonth !== currentMonth
}

export function shouldCopyTransactions(lastAccessDate: string | null, currentDate: string): boolean {
  if (!lastAccessDate) return false

  const lastMonth = lastAccessDate.substring(0, 7) // YYYY-MM format
  const currentMonth = currentDate.substring(0, 7)

  // Don't copy if it's the same month
  if (lastMonth === currentMonth) return false

  // Extract year and month
  const [lastYear, lastMonthNum] = lastMonth.split("-").map(Number)
  const [currentYear, currentMonthNum] = currentMonth.split("-").map(Number)

  // Only copy if it's consecutive months or same year
  if (currentYear > lastYear) {
    // If year changed, only copy if it's January and the last month was December
    return currentMonthNum === 1 && lastMonthNum === 12
  } else {
    // Same year, check if months are consecutive
    return currentMonthNum === lastMonthNum + 1
  }
}
