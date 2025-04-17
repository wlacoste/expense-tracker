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
    },
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
