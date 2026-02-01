// Define the structure of our translations
export interface Translations {
  settings: {
    title: string
    theme: {
      title: string
      description: string
      darkMode: string
    }
    language: {
      title: string
      description: string
    }
    dataManagement: {
      title: string
      description: string
      exportData: string
      resetAllData: string
      resetConfirmTitle: string
      resetConfirmDescription: string
      cancel: string
      confirm: string
    }
    about: {
      title: string
      description: string
      version: string
    }
  }
  dashboard: {
    title: string
    income: string
    expenses: {
      title: string
      note: string
    }
    budgeted: string
    monthlySavings: {
      title: string
      note: string
    }
    currentSavings: {
      title: string
      note: string
    }
    endOfMonthProjection: {
      title: string
      note: string
    }
    creditCard: {
      title: string
      total: string
      executed: string
      pending: string
      pendingWarning: string
      cards: string
      toggle: string
      pendingSmall: string
      upcoming: string
      totalLabel: string
      closing: string
      due: string
    }
    categories: {
      title: string
      add: string
      overBudget: string
      noCategories: string
    }
    sortCategories: string
    sortOptions: {
      chronological: string
      chronologicalInverse: string
      alphabetical: string
      alphabeticalInverse: string
      budget: string
      budgetInverse: string
      lastExpense: string
      lastExpenseInverse: string
    }
    noExpensesInCategory: string
    addIncome: string
    addExpense: string
    addCategory: string
    addLabel: string
  }
  dialog:{
    pleaseEnterCategoryName: string
    addCategoryTitle: string
    categoryNameLabel: string
    categoryBudgetLabel: string
    categoryColorLabel: string
    addCategoryButton: string
    categoryNamePlaceholder: string
    addCreditCardTitle: string
    creditCardDescriptionLabel: string
    creditCardClosingDayLabel: string
    creditCardDueDayLabel: string
    creditCardGoodThruLabel: string
    creditCardPausedLabel: string
    addCreditCardButton: string
    creditCardDescriptionAlert: string
    creditCardClosingDayAlert: string
    creditCardDueDayAlert: string
    creditCardGoodThruAlert: string
    selectMonthPlaceholder: string
    selectYearPlaceholder: string
    months: string[]
  }
  creditCardDialog: {
    alerts: {
      invalidAmount: string
      invalidInstallments: string
      creditCardNotFound: string
    }
    addExpenseTitle: string
    amountLabel: string
    descriptionLabel: string
    categoryLabel: string
    creditCardLabel: string
    creditCardPlaceholder: string
    noCreditCardsOption: string
    clearSelectionSr: string
    installmentsLabel: string
    installmentsPlaceholder: string
    singlePayment: string
    installmentsOption: (count: number) => string
    otherInstallmentsOption: string
    customInstallmentsPlaceholder: string
    perInstallment: string
    executionNotice: string
    dateLabel: string
    recurringExpenseLabel: string
    recurringNoteSingle: string
    recurringNoteMultiple: string
    addExpenseButton: string
    selectCategoryPlaceholder: string
    categoryInputPlaceholder: string
  }
  incomeDialog: {
    title: string
    description: string
    descriptionPlaceholder: string
    amount: string
    amountPlaceholder: string
    paused: string
    date: string
    submit: string
    alerts: {
      noDescription: string
      invalidAmount: string
    }
  }
}

// Define the available languages
export type AvailableLanguage = "en" | "es"

// Create the translations object
const translations: Record<AvailableLanguage, Translations> = {
  en: {
    settings: {
      title: "Settings",
      theme: {
        title: "Theme",
        description: "Customize the appearance of the app",
        darkMode: "Dark Mode",
      },
      language: {
        title: "Language",
        description: "Choose your preferred language",
      },
      dataManagement: {
        title: "Data Management",
        description: "Manage your app data",
        exportData: "Export Data",
        resetAllData: "Reset All Data",
        resetConfirmTitle: "Reset All Data",
        resetConfirmDescription:
          "This will permanently delete all your data, including expenses, income sources, and categories. This action cannot be undone.",
        cancel: "Cancel",
        confirm: "Reset All Data",
      },
      about: {
        title: "About",
        description: "Application information",
        version: "Version",
      },
    },
    dashboard: {
      title: "Dashboard",
      income: "Income",
      expenses: {
        title: "Expenses",
        note: "(Excluding future credit card expenses)",
      },
      budgeted: "Budgeted",
      monthlySavings: {
        title: "Monthly Savings",
        note: "End of month",
      },
      currentSavings: {
        title: "Current Savings",
        note: "(Up to today)",
      },
      endOfMonthProjection: {
        title: "End of Month Projection",
        note: "(Including pending expenses)",
      },
      creditCard: {
        title: "Credit Card Expenses This Month",
        total: "Total",
        executed: "Executed",
        pending: "Pending",
        pendingWarning: "You have pending credit card expenses this month",
        cards: "Credit Cards",
        toggle: "Toggle Credit Cards",
        pendingSmall: "pending",
        upcoming: "Upcoming",
        totalLabel: "Total:",
        closing: "Closing:",
        due: "Due:",
      },
      categories: {
        title: "Budget Categories",
        add: "Add Category",
        overBudget:"Over budget by ",
        noCategories: "No budget categories yet.",
      },
      sortCategories: "Sort categories",
      sortOptions: {
        chronological: "Chronologically",
        chronologicalInverse: "Chronologically Inverse",
        alphabetical: "Alphabetically",
        alphabeticalInverse: "Alphabetically Inverse",
        budget: "By Budget",
        budgetInverse: "By Budget Inverse",
        lastExpense: "By Last Expense",
        lastExpenseInverse: "By Last Expense Inverse",
      },
      noExpensesInCategory: "No expenses in this category",
      addIncome: "Add Income",
      addExpense: "Add Expense",
      addCategory: "Add Category",
      addLabel: "Add"
    },
    dialog:{
      pleaseEnterCategoryName: "Please enter a category name",
      addCategoryTitle: "Add Category",
      categoryNameLabel: "Name",
      categoryBudgetLabel: "Monthly Budget (optional)",
      categoryColorLabel: "Color",
      addCategoryButton: "Add Category",
      categoryNamePlaceholder: "e.g., Groceries, Rent, Entertainment",
      addCreditCardTitle: "Add Credit Card",
      creditCardDescriptionLabel: "Description",
      creditCardClosingDayLabel: "Closing Day (1-30)",
      creditCardDueDayLabel: "Due Day (1-30)",
      creditCardGoodThruLabel: "Good Thru (Month/Year)",
      creditCardPausedLabel: "Pause this credit card",
      addCreditCardButton: "Add Credit Card",
      creditCardDescriptionAlert: "Please enter a description",
      creditCardClosingDayAlert: "Please enter a valid closing day (1-30)",
      creditCardDueDayAlert: "Please enter a valid due day (1-30)",
      creditCardGoodThruAlert: "Please select both month and year for Good Thru date",
      selectMonthPlaceholder: "Month",
      selectYearPlaceholder: "Year",
      months: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
    },
    creditCardDialog: {
      alerts: {
        invalidAmount: "Please enter a valid amount",
        invalidInstallments: "Please enter a valid number of installments (minimum 2)",
        creditCardNotFound: "Selected credit card not found"
      },
      addExpenseTitle: "Add Expense",
      amountLabel: "Amount",
      descriptionLabel: "Description (optional)",
      categoryLabel: "Category",
      creditCardLabel: "Credit Card (optional)",
      creditCardPlaceholder: "Select credit card",
      noCreditCardsOption: "No credit cards available",
      clearSelectionSr: "Clear selection",
      installmentsLabel: "Installments",
      installmentsPlaceholder: "Select number of installments",
      singlePayment: "1 (single payment)",
      installmentsOption: (n) => `${n} installments`,
      otherInstallmentsOption: "Other...",
      customInstallmentsPlaceholder: "Number of installments",
      perInstallment: "Per installment:",
      executionNotice: "This expense will be executed on ",
      dateLabel: "Date",
      recurringExpenseLabel: "Recurring monthly expense",
      recurringNoteSingle: "This expense will be automatically copied to future months.",
      recurringNoteMultiple: "This installment plan will be automatically copied to future months when a new month starts.",
      addExpenseButton: "Add Expense",
      selectCategoryPlaceholder: "Select category",
      categoryInputPlaceholder: "e.g., Grocery shopping",
    },
    incomeDialog: {
      title: "Add Income",
      description: "Description",
      descriptionPlaceholder: "e.g., Salary, Freelance work",
      amount: "Amount",
      amountPlaceholder: "0.00",
      paused: "Pause this income",
      date: "Date",
      submit: "Add Income",
      alerts: {
        noDescription: "Please enter a description",
        invalidAmount: "Please enter a valid amount",
      },
    }
  },
  es: {
    settings: {
      title: "Configuración",
      theme: {
        title: "Tema",
        description: "Personaliza la apariencia de la aplicación",
        darkMode: "Modo Oscuro",
      },
      language: {
        title: "Idioma",
        description: "Elige tu idioma preferido",
      },
      dataManagement: {
        title: "Gestión de Datos",
        description: "Administra los datos de tu aplicación",
        exportData: "Exportar Datos",
        resetAllData: "Restablecer Todos los Datos",
        resetConfirmTitle: "Restablecer Todos los Datos",
        resetConfirmDescription:
          "Esto eliminará permanentemente todos tus datos, incluyendo gastos, fuentes de ingresos y categorías. Esta acción no se puede deshacer.",
        cancel: "Cancelar",
        confirm: "Restablecer Todos los Datos",
      },
      about: {
        title: "Acerca de",
        description: "Información de la aplicación",
        version: "Versión",
      },
    },
    dashboard: {
      title: "Resumen",
      income: "Ingresos",
      expenses: {
        title: "Gastos",
        note: "(Excluyendo gastos futuros con tarjeta de crédito)",
      },
      budgeted: "Presupuestado",
      monthlySavings: {
        title: "Ahorro Mensual",
        note: "Fin de mes",
      },
      currentSavings: {
        title: "Ahorro Actual",
        note: "(Hasta hoy)",
      },
      endOfMonthProjection: {
        title: "Proyección Fin de Mes",
        note: "(Incluye gastos pendientes)",
      },
      creditCard: {
        title: "Gastos con Tarjeta de Crédito Este Mes",
        total: "Total",
        executed: "Ejecutado",
        pending: "Pendiente",
        pendingWarning: "Tienes gastos pendientes con tarjeta de crédito este mes",
        cards: "Tarjetas de Crédito",
        toggle: "Mostrar/Ocultar Tarjetas de Crédito",
        upcoming: "Próximo",
        pendingSmall: "pendiente",
        totalLabel: "Total:",
        closing: "Cierre:",
        due: "Vencimiento:",
      },
      categories: {
        title: "Categorías de Presupuesto",
        add: "Agregar Categoría",
        overBudget:"Sobrepasado en ",
        noCategories: "Sin categorías de presupuesto aún.",
      },
      sortCategories: "Ordenar categorías",
      sortOptions: {
        chronological: "Cronológicamente",
        chronologicalInverse: "Cronológicamente Inverso",
        alphabetical: "Alfabéticamente",
        alphabeticalInverse: "Alfabéticamente Inverso",
        budget: "Por Presupuesto",
        budgetInverse: "Por Presupuesto Inverso",
        lastExpense: "Por Último Gasto",
        lastExpenseInverse: "Por Último Gasto Inverso",
      },
      noExpensesInCategory: "No hay gastos en esta categoría",
      addIncome: "Nuevo ingreso",
      addExpense: "Nuevo gasto",
      addCategory: "Nueva categoría",
      addLabel: "Agregar"
    },
    dialog:{
      pleaseEnterCategoryName: "Por favor introduce un nombre para la categoría",
      addCategoryTitle: "Agregar Categoría",
      categoryNameLabel: "Nombre",
      categoryBudgetLabel: "Presupuesto Mensual (opcional)",
      categoryColorLabel: "Color",
      addCategoryButton: "Agregar Categoría",
      categoryNamePlaceholder: "ej. Comida, Alquiler, Entretenimiento",
      addCreditCardTitle: "Agregar Tarjeta de Crédito",
      creditCardDescriptionLabel: "Descripción",
      creditCardClosingDayLabel: "Día de Cierre (1-30)",
      creditCardDueDayLabel: "Día de Vencimiento (1-30)",
      creditCardGoodThruLabel: "Válida Hasta (Mes/Año)",
      creditCardPausedLabel: "Pausar esta tarjeta de crédito",
      addCreditCardButton: "Agregar Tarjeta de Crédito",
      creditCardDescriptionAlert: "Por favor ingresa una descripción",
      creditCardClosingDayAlert: "Por favor ingresa un día de cierre válido (1-30)",
      creditCardDueDayAlert: "Por favor ingresa un día de vencimiento válido (1-30)",
      creditCardGoodThruAlert: "Por favor selecciona mes y año para la fecha de vencimiento",
      selectMonthPlaceholder: "Mes",
      selectYearPlaceholder: "Año",
      months: [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ],
    },
    creditCardDialog: {
      alerts: {
        invalidAmount: "Por favor ingresa un monto válido",
        invalidInstallments: "Por favor ingresa un número válido de cuotas (mínimo 2)",
        creditCardNotFound: "No se encontró la tarjeta seleccionada"
      },
      addExpenseTitle: "Agregar Gasto",
      amountLabel: "Monto",
      descriptionLabel: "Descripción (opcional)",
      categoryLabel: "Categoría",
      creditCardLabel: "Tarjeta de Crédito (opcional)",
      creditCardPlaceholder: "Selecciona tarjeta de crédito",
      noCreditCardsOption: "No hay tarjetas disponibles",
      clearSelectionSr: "Limpiar selección",
      installmentsLabel: "Cuotas",
      installmentsPlaceholder: "Selecciona número de cuotas",
      singlePayment: "1 (pago único)",
      installmentsOption: (n) => `${n} cuotas`,
      otherInstallmentsOption: "Otra...",
      customInstallmentsPlaceholder: "Número de cuotas",
      perInstallment: "Por cuota:",
      executionNotice: "Este gasto se ejecutará el ",
      dateLabel: "Fecha",
      recurringExpenseLabel: "Gasto mensual recurrente",
      recurringNoteSingle: "Este gasto se copiará automáticamente en los meses siguientes.",
      recurringNoteMultiple: "Este plan de cuotas se copiará automáticamente en los meses siguientes al comenzar un nuevo mes.",
      addExpenseButton: "Agregar Gasto",
      selectCategoryPlaceholder: "Selecciona categoría",
      categoryInputPlaceholder: "p. ej., Compra de supermercado",
    },
     incomeDialog: {
      title: "Nuevo Ingreso",
      description: "Descripción",
      descriptionPlaceholder: "por ej., Sueldo, Trabajo freelance",
      amount: "Monto",
      amountPlaceholder: "0,00",
      paused: "Pausar este ingreso",
      date: "Fecha",
      submit: "Agregar Ingreso",
      alerts: {
        noDescription: "Por favor ingresa una descripción",
        invalidAmount: "Por favor ingresa un monto válido",
      },
    },
  },
}

// Helper function to get translations
export function getTranslations(language: AvailableLanguage): Translations {
  return translations[language] || translations.en
}

// Available languages for the UI
export const availableLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
]
