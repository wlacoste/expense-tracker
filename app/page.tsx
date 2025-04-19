"use client"

import { useEffect, useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Dashboard from "@/components/dashboard/index"
import Transactions from "@/components/transactions"
import Analytics from "@/components/analytics"
import Settings from "@/components/settings"
import Navigation from "@/components/navigation"
import AddButton from "@/components/add-button"
import AddExpenseDialog from "@/components/add-expense-dialog"
import AddIncomeDialog from "@/components/add-income-dialog"
import AddCategoryDialog from "@/components/add-category-dialog"
import AddCreditCardDialog from "@/components/add-credit-card-dialog"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import {
  loadData,
  saveData,
  getLastAccessDate,
  updateLastAccessDate,
  copyIncomesToNewMonth,
  copyRecurringExpensesToNewMonth,
  copyInstallmentExpensesToNewMonth,
  shouldCopyTransactions,
  isOnline,
  registerConnectivityListeners,
} from "@/lib/storage"
import { getMonthlyIncomes } from "@/lib/utils"
import type { AvailableLanguage } from "@/lib/translations"
import type { Expense, Income, Category, CreditCard } from "@/components/dashboard/types"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [creditCardDialogOpen, setCreditCardDialogOpen] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [language, setLanguage] = useState<AvailableLanguage>("en") // Default language is English
  const [categorySorting, setCategorySorting] = useState<string>("chronological")
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const { toast } = useToast()

  // Add a new state for the preselected category
  const [preselectedCategoryId, setPreselectedCategoryId] = useState<string | undefined>(undefined)

  // Calculate the count of enabled categories for the orderNumber
  const enabledCategoriesCount = categories.filter((cat) => !cat.isDisabled).length

  // In the handleAddExpenseWithCategory function, check if the category is disabled
  const handleAddExpenseWithCategory = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    if (category && !category.isDisabled) {
      setPreselectedCategoryId(categoryId)
      setExpenseDialogOpen(true)
    }
  }

  // Add this useEffect to handle online/offline status
  useEffect(() => {
    // Show initial offline status if needed
    if (!isOnline()) {
      toast({
        title: "You're offline",
        description: "The app will continue to work. Changes will sync when you're back online.",
        duration: 5000,
      })
    }

    // Register for online/offline events
    const cleanup = registerConnectivityListeners(
      // Online callback
      () => {
        toast({
          title: "You're back online",
          description: "Your data will now sync automatically.",
          duration: 3000,
        })
      },
      // Offline callback
      () => {
        toast({
          title: "You're offline",
          description: "The app will continue to work. Changes will sync when you're back online.",
          duration: 5000,
        })
      },
    )

    // Clean up event listeners
    return cleanup
  }, [toast])

  // Calculate total monthly income for the current month
  const calculateTotalMonthlyIncome = () => {
    const monthlyIncomes = getMonthlyIncomes(incomes, selectedMonth)
    return monthlyIncomes.filter((income) => !income.isPaused).reduce((total, income) => total + income.amount, 0)
  }

  // Update the getOrCreateOthersCategory function to handle the new fields
  const getOrCreateOthersCategory = () => {
    const othersCategory = categories.find((cat) => cat.name === "Others")
    const totalMonthlyIncome = calculateTotalMonthlyIncome()

    if (!othersCategory) {
      // Create the Others category if it doesn't exist
      const newOthersCategory = {
        id: `others-${Date.now()}`,
        name: "Others",
        color: "#9CA3AF", // Gray color
        budget: totalMonthlyIncome,
        orderNumber: categories.length, // Set to the end
        isDisabled: false, // Enabled by default
      }
      // Important: Update the categories state immediately
      setCategories((prevCategories) => [...prevCategories, newOthersCategory])
      return newOthersCategory
    } else if (othersCategory.budget !== totalMonthlyIncome) {
      // Update the Others category budget if it's different from total monthly income
      const updatedOthersCategory = {
        ...othersCategory,
        budget: totalMonthlyIncome,
      }
      // Important: Update the categories state immediately
      setCategories((prevCategories) =>
        prevCategories.map((cat) => (cat.id === updatedOthersCategory.id ? updatedOthersCategory : cat)),
      )
      return updatedOthersCategory
    }

    return othersCategory
  }

  // Update the ensureOthersCategoryInList function to handle the new fields
  const ensureOthersCategoryInList = (categoriesList: Category[]) => {
    const othersCategory = categoriesList.find((cat) => cat.name === "Others")
    let updatedCategories = [...categoriesList]

    if (!othersCategory) {
      // Create the Others category with the current total monthly income as budget
      const totalMonthlyIncome = calculateTotalMonthlyIncome()
      const newOthersCategory = {
        id: `others-${Date.now()}`,
        name: "Others",
        color: "#9CA3AF", // Gray color
        budget: totalMonthlyIncome,
        orderNumber: categoriesList.length, // Set to the end
        isDisabled: false, // Enabled by default
      }
      updatedCategories.push(newOthersCategory)
    } else {
      // Remove the Others category so we can add it back at the end
      updatedCategories = updatedCategories.filter((cat) => cat.name !== "Others")
      updatedCategories.push(othersCategory)
    }

    return updatedCategories
  }

  // Update the "Others" category budget when incomes or selected month changes
  useEffect(() => {
    const othersCategory = categories.find((cat) => cat.name === "Others")
    if (othersCategory) {
      const totalMonthlyIncome = calculateTotalMonthlyIncome()
      if (othersCategory.budget !== totalMonthlyIncome) {
        const updatedCategory = {
          ...othersCategory,
          budget: totalMonthlyIncome,
        }
        setCategories(categories.map((cat) => (cat.id === othersCategory.id ? updatedCategory : cat)))
      }
    }
  }, [incomes, selectedMonth, categories])

  // Load data from localStorage on initial render
  useEffect(() => {
    const data = loadData()
    if (data) {
      setExpenses(data.expenses || [])
      setIncomes(data.incomes || [])

      // Set categories and ensure "Others" category exists
      const loadedCategories = data.categories || []
      const hasOthersCategory = loadedCategories.some((cat) => cat.name === "Others")

      if (!hasOthersCategory) {
        // Create the Others category if it doesn't exist
        const othersCategory = {
          id: `others-${Date.now()}`,
          name: "Others",
          color: "#9CA3AF", // Gray color
          budget: 0,
          orderNumber: loadedCategories.length, // Set to the end
          isDisabled: false, // Enabled by default
        }
        setCategories([...loadedCategories, othersCategory])
      } else {
        setCategories(loadedCategories)
      }

      setCreditCards(data.creditCards || [])
      // Load language preference if available
      if (data.language) {
        setLanguage(data.language as AvailableLanguage)
      }

      if (data?.categorySorting) {
        setCategorySorting(data.categorySorting)
      }
    } else {
      // If no data exists, initialize with an "Others" category
      const othersCategory = {
        id: `others-${Date.now()}`,
        name: "Others",
        color: "#9CA3AF", // Gray color
        budget: 0,
        orderNumber: 0,
        isDisabled: false,
      }
      setCategories([othersCategory])
    }

    // Check if we need to copy incomes to a new month
    const today = new Date()
    const currentDateStr = today.toISOString().split("T")[0]
    const currentMonth = currentDateStr.substring(0, 7) // YYYY-MM format
    const lastAccessDate = getLastAccessDate()

    if (shouldCopyTransactions(lastAccessDate, currentDateStr)) {
      // Get the previous month
      const lastMonth = lastAccessDate?.substring(0, 7) || ""

      if (lastMonth && data) {
        // Copy non-paused incomes from the previous month to the current month
        const newIncomes = copyIncomesToNewMonth(data.incomes, lastMonth, currentMonth)

        // Copy recurring expenses from the previous month to the current month
        const newRecurringExpenses = copyRecurringExpensesToNewMonth(data.expenses, lastMonth, currentMonth)

        // Copy installment expenses from the previous month to the current month
        const newInstallmentExpenses = copyInstallmentExpensesToNewMonth(
          data.expenses,
          data.creditCards,
          lastMonth,
          currentMonth,
        )

        // Add the new incomes and expenses to the existing ones
        setIncomes([...data.incomes, ...newIncomes])
        setExpenses([...data.expenses, ...newRecurringExpenses, ...newInstallmentExpenses])

        // Show a notification
        const totalCopied = newIncomes.length + newRecurringExpenses.length + newInstallmentExpenses.length
        if (totalCopied > 0) {
          toast({
            title: "Monthly Transactions Copied",
            description: `${newIncomes.length} recurring income items, ${newRecurringExpenses.length} recurring expenses, and ${newInstallmentExpenses.length} installment expenses were copied to ${currentMonth}.`,
          })
        }
      }
    }

    // Update the last access date
    updateLastAccessDate(currentDateStr)
  }, [toast])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    saveData({
      expenses,
      incomes,
      categories,
      creditCards,
      lastAccessDate: today,
      language,
      categorySorting, // Add this line
    })
  }, [expenses, incomes, categories, creditCards, language, categorySorting])

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as AvailableLanguage)
    toast({
      title: "Language Changed",
      description: `The application language has been changed.`,
    })
  }

  // Find the addExpense function and update it to ensure the "Others" category is created and assigned properly

  // Update the addExpense function to ensure proper category assignment
  const addExpense = (expense: Expense | Expense[]) => {
    // Get or create the "Others" category with budget equal to total monthly income
    const othersCategory = getOrCreateOthersCategory()

    if (Array.isArray(expense)) {
      // Handle multiple expenses (installments)
      const expensesWithIds = expense.map((exp) => ({
        ...exp,
        id: Date.now() + Math.random().toString(36).substring(2, 9),
        // Assign to Others category if no category is selected
        categoryId: exp.categoryId || othersCategory.id,
      }))
      setExpenses([...expensesWithIds, ...expenses]) // Add new expenses at the beginning
      toast({
        title: "Installment expense added",
        description: `Your expense has been split into ${expensesWithIds.length} installments.`,
      })
    } else {
      // Handle single expense
      setExpenses([
        {
          ...expense,
          id: Date.now().toString(),
          // Assign to Others category if no category is selected
          categoryId: expense.categoryId || othersCategory.id,
        },
        ...expenses, // Add new expense at the beginning
      ])
      toast({
        title: "Expense added",
        description: "Your expense has been added successfully.",
      })
    }
    setExpenseDialogOpen(false)
  }

  const addIncome = (income: Income) => {
    setIncomes([...incomes, { ...income, id: Date.now().toString() }])
    toast({
      title: "Income added",
      description: "Your income has been added successfully.",
    })
    setIncomeDialogOpen(false)
  }

  // Update the addCategory function to handle the new fields
  const addCategory = (category: Category) => {
    setCategories([...categories, { ...category, id: Date.now().toString() }])
    toast({
      title: "Category added",
      description: "Your category has been added successfully.",
    })
    setCategoryDialogOpen(false)
  }

  const addCreditCard = (creditCard: CreditCard) => {
    setCreditCards([...creditCards, { ...creditCard, id: Date.now().toString() }])
    toast({
      title: "Credit Card added",
      description: "Your credit card has been added successfully.",
    })
    setCreditCardDialogOpen(false)
  }

  const updateExpense = (updatedExpense: Expense) => {
    // Get or create the "Others" category if needed
    const othersCategory = categories.find((cat) => cat.name === "Others") || getOrCreateOthersCategory()

    // Ensure the expense has a category
    if (!updatedExpense.categoryId) {
      updatedExpense.categoryId = othersCategory.id
    }

    setExpenses(expenses.map((expense) => (expense.id === updatedExpense.id ? updatedExpense : expense)))
    toast({
      title: "Expense updated",
      description: "Your expense has been updated successfully.",
    })
  }

  const updateIncome = (updatedIncome: Income) => {
    setIncomes(incomes.map((income) => (income.id === updatedIncome.id ? updatedIncome : income)))
    toast({
      title: "Income updated",
      description: "Your income has been updated successfully.",
    })
  }

  const updateCategory = (updatedCategory: Category) => {
    setCategories(categories.map((category) => (category.id === updatedCategory.id ? updatedCategory : category)))
  }

  const updateCreditCard = (updatedCreditCard: CreditCard) => {
    setCreditCards(creditCards.map((card) => (card.id === updatedCreditCard.id ? updatedCreditCard : card)))
    toast({
      title: "Credit Card updated",
      description: "Your credit card has been updated successfully.",
    })
  }

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
    toast({
      title: "Expense deleted",
      description: "Your expense has been deleted successfully.",
    })
  }

  const deleteMultipleExpenses = (ids: string[]) => {
    // Create a new array excluding the expenses with the specified IDs
    setExpenses(expenses.filter((expense) => !ids.includes(expense.id)))

    toast({
      title: "Expenses deleted",
      description: `${ids.length} expenses have been deleted successfully.`,
    })
  }

  const deleteIncome = (id: string) => {
    setIncomes(incomes.filter((income) => income.id !== id))
    toast({
      title: "Income deleted",
      description: "Your income has been deleted successfully.",
    })
  }

  const deleteCategory = (id: string) => {
    // First check if it's the "Others" category
    const category = categories.find((cat) => cat.id === id)
    if (category && category.name === "Others") {
      toast({
        title: "Cannot delete system category",
        description: "The 'Others' category is a system category and cannot be deleted.",
        variant: "destructive",
      })
      return
    }

    // Check if category is used in any expense
    const categoryInUse = expenses.some((expense) => expense.categoryId === id)
    if (categoryInUse) {
      toast({
        title: "Cannot delete category",
        description: "This category is used in one or more expenses.",
        variant: "destructive",
      })
      return
    }

    setCategories(categories.filter((category) => category.id !== id))
    toast({
      title: "Category deleted",
      description: "Your category has been deleted successfully.",
    })
  }

  const deleteCreditCard = (id: string) => {
    // Check if credit card is used in any expense
    const cardInUse = expenses.some((expense) => expense.creditCardId === id)
    if (cardInUse) {
      toast({
        title: "Cannot delete credit card",
        description: "This credit card is used in one or more expenses.",
        variant: "destructive",
      })
      return
    }

    setCreditCards(creditCards.filter((card) => card.id !== id))
    toast({
      title: "Credit Card deleted",
      description: "Your credit card has been deleted successfully.",
    })
  }

  const resetAllData = () => {
    setExpenses([])
    setIncomes([])
    setCategories([])
    setCreditCards([])
    toast({
      title: "Data reset",
      description: "All your data has been reset successfully.",
    })
  }

  // Update the renderContent function to pass the new props to Dashboard and Analytics
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            expenses={expenses}
            incomes={incomes}
            categories={ensureOthersCategoryInList(categories)}
            creditCards={creditCards}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            onAddCategory={() => setCategoryDialogOpen(true)}
            onAddExpenseWithCategory={handleAddExpenseWithCategory}
            language={language}
            categorySorting={categorySorting}
            setCategorySorting={setCategorySorting}
          />
        )
      case "transactions":
        return (
          <Transactions
            expenses={expenses}
            incomes={incomes}
            categories={ensureOthersCategoryInList(categories)}
            creditCards={creditCards}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            onUpdateExpense={updateExpense}
            onDeleteExpense={deleteExpense}
            onDeleteMultipleExpenses={deleteMultipleExpenses}
            onAddCategory={() => setCategoryDialogOpen(true)}
            onAddCreditCard={() => setCreditCardDialogOpen(true)}
            onUpdateIncome={updateIncome}
            onDeleteIncome={deleteIncome}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
            onUpdateCreditCard={updateCreditCard}
            onDeleteCreditCard={deleteCreditCard}
          />
        )
      case "analytics":
        return (
          <Analytics
            expenses={expenses}
            incomes={incomes}
            categories={categories}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />
        )
      case "settings":
        return (
          <Settings
            categories={categories}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
            onAddCategory={() => setCategoryDialogOpen(true)}
            incomes={incomes}
            onUpdateIncome={updateIncome}
            onDeleteIncome={deleteIncome}
            onResetAllData={resetAllData}
            language={language}
            onLanguageChange={handleLanguageChange}
          />
        )
      default:
        return (
          <Dashboard
            expenses={expenses}
            incomes={incomes}
            categories={ensureOthersCategoryInList(categories)}
            creditCards={creditCards}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            onAddCategory={() => setCategoryDialogOpen(true)}
            onAddExpenseWithCategory={handleAddExpenseWithCategory}
            language={language}
            categorySorting={categorySorting}
            setCategorySorting={setCategorySorting}
          />
        )
    }
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="expense-tracker-theme"
    >
      <main className="min-h-screen bg-background text-foreground pb-16">
        {renderContent()}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <AddButton
          onAddExpense={() => setExpenseDialogOpen(true)}
          onAddIncome={() => setIncomeDialogOpen(true)}
          onAddCategory={() => setCategoryDialogOpen(true)}
        />
        <AddExpenseDialog
          open={expenseDialogOpen}
          onOpenChange={(open) => {
            setExpenseDialogOpen(open)
            if (!open) setPreselectedCategoryId(undefined) // Reset when dialog closes
          }}
          onAddExpense={addExpense}
          categories={ensureOthersCategoryInList(categories)}
          creditCards={creditCards}
          preselectedCategoryId={preselectedCategoryId}
        />
        <AddIncomeDialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen} onAddIncome={addIncome} />
        <AddCategoryDialog
          open={categoryDialogOpen}
          onOpenChange={setCategoryDialogOpen}
          onAddCategory={addCategory}
          enabledCategoriesCount={enabledCategoriesCount}
        />
        <AddCreditCardDialog
          open={creditCardDialogOpen}
          onOpenChange={setCreditCardDialogOpen}
          onAddCreditCard={addCreditCard}
        />
        <Toaster />
      </main>
    </ThemeProvider>
  )
}
