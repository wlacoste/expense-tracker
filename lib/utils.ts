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

console.log("today", typeof today === "string", today )
  // Normalize the input
  const dateObj = typeof today === "string" ? new Date(`${today}T00:00:00Z`) : today;

  const {
    nextDue,
    nextClosing,
    nextDueSecond,
  } = calculateDates(dateObj, closingDay, dueDay);

  const nextDueDate = new Date(`${nextDue}T00:00:00Z`);
  const nextClosingDate = new Date(`${nextClosing}T00:00:00Z`);

  // If due is before closing → use next due
  // If due is after closing → use second due
  console.log("dateObj < nextClosingDate",dateObj < nextClosingDate)
  console.log("dateObj > nextClosingDate",dateObj > nextClosingDate, "dateObj",dateObj,"nextClosingDate", nextClosingDate)
  const executionDate = dateObj <= nextClosingDate
    ? nextDueDate
    : new Date(`${nextDueSecond}T00:00:00Z`);

  return executionDate;
}


export function getTodayDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0") // Month is 0-indexed
  const day = String(today.getDate()).padStart(2, "0")

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

export function getCreditCardDates(year: number, month: number, closingDay: number, dueDay: number ) {
  const today = new Date()

  let nextMonthYear = year
  let nextMonth = month + 1

  if (nextMonth > 12) {
    nextMonth = 1
    nextMonthYear++
  }
  const closingDateThisMonth = new Date(year, month - 1, closingDay)
  const dueDateThisMonth = new Date(year, month - 1, dueDay)

  // If closing day has passed, the next closing is next month
  if (closingDateThisMonth < today) {
    closingDateThisMonth.setMonth(closingDateThisMonth.getMonth() + 1)
  }

  // If due day has passed, the next due date is next month
  if (dueDateThisMonth < today) {
    dueDateThisMonth.setMonth(dueDateThisMonth.getMonth() + 1)
  }

  // Calculate next month's closing and due dates
  const closingDateNextMonth = new Date(nextMonthYear, nextMonth - 1, closingDay)
  if (closingDay > dueDay) {
    nextMonth++
    if (nextMonth > 12) {
      nextMonth = 1
      nextMonthYear++
    }
  }
  const dueDateNextMonth = new Date(nextMonthYear, nextMonth - 1, dueDay)

  return {closingDateThisMonth, dueDateThisMonth, closingDateNextMonth, dueDateNextMonth}
}

export function getCreditCardRelevantDates(closingDay: number, dueDay: number, buyingDate: Date) {
  const y = buyingDate.getFullYear();
  const m = buyingDate.getMonth();
  const d = buyingDate.getDate();

  const baseDate = new Date(y, m, d, 12); // Set hour to 12 to avoid timezone issues

  const getSafeDate = (year: number, month: number, day: number) => new Date(year, month, day, 12);

   // Due dates
  const dueDateThisMonth = getSafeDate(y, m, dueDay);
  const dueDateLastMonth = getSafeDate(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1, dueDay);
  const dueDateNextMonth = getSafeDate(m === 11 ? y + 1 : y, m === 11 ? 0 : m + 1, dueDay);

  // Closing dates
  const closingDateThisMonth = getSafeDate(y, m, closingDay);
  const closingDateLastMonth = getSafeDate(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1, closingDay);
  const closingDateNextMonth = getSafeDate(m === 11 ? y + 1 : y, m === 11 ? 0 : m + 1, closingDay);

  const previousDueDate = baseDate >= dueDateThisMonth ? dueDateThisMonth : dueDateLastMonth;
  const nextDueDate = baseDate < dueDateThisMonth ? dueDateThisMonth : dueDateNextMonth;

  const previousClosingDate = baseDate >= closingDateThisMonth ? closingDateThisMonth : closingDateLastMonth;
  const nextClosingDate = baseDate < closingDateThisMonth ? closingDateThisMonth : closingDateNextMonth;


  // Calculate second next dates
  const secondNextDueDate = getSafeDate(
    nextDueDate.getMonth() === 11 ? nextDueDate.getFullYear() + 1 : nextDueDate.getFullYear(),
    (nextDueDate.getMonth() + 1) % 12,
    dueDay
  );

  const secondNextClosingDate = getSafeDate(
    nextClosingDate.getMonth() === 11 ? nextClosingDate.getFullYear() + 1 : nextClosingDate.getFullYear(),
    (nextClosingDate.getMonth() + 1) % 12,
    closingDay
  );

  return { previousDueDate, nextDueDate, nextClosingDate, secondNextDueDate, secondNextClosingDate , previousClosingDate};
}

export function getSafeDateFromMonthAndYear(month: number, year: number): Date {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1; // 1-based
  const todayDay = today.getDate();

  const isCurrentMonth = year === todayYear && month === todayMonth;

  // Find how many days this month has
  const lastDayOfMonth = new Date(year, month, 0).getDate(); // day 0 of next month gives last day of current

  const day = isCurrentMonth
    ? Math.min(todayDay, lastDayOfMonth)
    : 1;

  return new Date(year, month - 1, day, 12); // hour 12 avoids timezone issues
}

export function calculateDates(givenDate: Date, closingDay: number, dueDay: number) {
  const addMonths = (date: Date, months: number) => {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()));
    return d;
  };

  const setDay = (date: Date, day: number) => {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const safeDay = Math.min(day, lastDay); // Prevent overflow (e.g. Feb 30)
    return new Date(Date.UTC(year, month, safeDay));
  };

  const formatDate = (date: Date) => date.toISOString().substring(0, 10);

  // Normalize givenDate
  givenDate = new Date(Date.UTC(givenDate.getUTCFullYear(), givenDate.getUTCMonth(), givenDate.getUTCDate()));

  // Step 1: Find next immediate due date
  let nextDue: Date;
  if (givenDate.getUTCDate() < dueDay) {
    nextDue = setDay(givenDate, dueDay);
  } else {
    nextDue = setDay(addMonths(givenDate, 1), dueDay);
  }

  // Step 2: Set next closing (immediately before that due)
  let nextClosing: Date;
  if (closingDay < dueDay) {
    nextClosing = setDay(nextDue, closingDay);
  } else {
    nextClosing = setDay(addMonths(nextDue, -1), closingDay);
  }

  // Step 3: Previous closing is one month before nextClosing
  const prevClosing = addMonths(nextClosing, -1);

  // Step 4: Previous due = prevClosing + (dueDay - closingDay)
  const diff = dueDay - closingDay;
  const prevDue = new Date(Date.UTC(prevClosing.getUTCFullYear(), prevClosing.getUTCMonth(), prevClosing.getUTCDate() + diff));

  // Step 5 & 6: Future projections
  const nextClosingSecond = addMonths(nextClosing, 1);
  const nextDueSecond = addMonths(nextDue, 1);

  return {
    prevClosing: formatDate(prevClosing),
    prevDue: formatDate(prevDue),
    nextClosing: formatDate(nextClosing),
    nextDue: formatDate(nextDue),
    nextClosingSecond: formatDate(nextClosingSecond),
    nextDueSecond: formatDate(nextDueSecond),
  };
}

export function calculateInterestEarned(reserve: Reserve): number {
  if (!reserve.interestRate) return 0;

  const principal = reserve.amount;
  const tna = reserve.interestRate / 100; // e.g. 37 → 0.37
  const baseDays = 360;

  const startDate = new Date(reserve.creationDate);
  const endDate =  new Date();

  const rawDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const diffInDays = Math.max(rawDays - 1, 0); // no negative interest

  const interest = principal * (tna / baseDays) * diffInDays;
  return interest;
}

export function calculateTotalInterest(reserve: Reserve): number {
  if (!reserve.interestRate) return 0;

  const principal = reserve.amount;
  const tna = reserve.interestRate / 100; // e.g. 37 → 0.37
  const baseDays = 360;

  const startDate = new Date(reserve.creationDate);
  const endDate = reserve.dissolutionDate ? new Date(reserve.dissolutionDate) : new Date();

  const rawDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const diffInDays = Math.max(rawDays - 1, 0); // no negative interest

  const interest = principal * (tna / baseDays) * diffInDays;
  return interest;
}
