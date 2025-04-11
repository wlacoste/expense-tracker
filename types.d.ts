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
  budget?: number
  color: string
}

interface CreditCard {
  id: string
  description: string
  closingDay: number
  dueDay: number
  goodThruDate: string
  isPaused: boolean
}
