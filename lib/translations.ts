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
