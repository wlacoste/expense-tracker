"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe } from "lucide-react"
import { type AvailableLanguage, availableLanguages, getTranslations } from "@/lib/translations"

interface Category {
  id: string
  name: string
  budget?: number
  color: string
}

interface Income {
  id: string
  description: string
  amount: number
  isPaused: boolean
  date: string
}

interface SettingsProps {
  categories: Category[]
  onUpdateCategory: (category: Category) => void
  onDeleteCategory: (id: string) => void
  onAddCategory: () => void
  incomes: Income[]
  onUpdateIncome: (income: Income) => void
  onDeleteIncome: (id: string) => void
  onResetAllData: () => void
  language: string
  onLanguageChange: (language: string) => void
}

export default function Settings({
  categories,
  onUpdateCategory,
  onDeleteCategory,
  onAddCategory,
  incomes,
  onUpdateIncome,
  onDeleteIncome,
  onResetAllData,
  language,
  onLanguageChange,
}: SettingsProps) {
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  // Get translations based on current language
  const t = getTranslations(language as AvailableLanguage)

  const handleExportData = () => {
    const data = localStorage.getItem("expense-tracker-data")
    if (data) {
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `expense-tracker-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t.settings.title}</h1>

      <div className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>{t.settings.theme.title}</CardTitle>
            <CardDescription>{t.settings.theme.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-mode">{t.settings.theme.darkMode}</Label>
              <Switch
                id="theme-mode"
                checked={theme === "dark"}
                onCheckedChange={() => {
                  // Force the theme to toggle between light and dark
                  const newTheme = theme === "dark" ? "light" : theme === "light" ? "dark" : "light"
                  setTheme(newTheme)
                  // Add a console log to help debug
                  console.log("Theme changed to:", newTheme)
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.settings.language.title}</CardTitle>
            <CardDescription>{t.settings.language.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <Select value={language} onValueChange={onLanguageChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.settings.dataManagement.title}</CardTitle>
            <CardDescription>{t.settings.dataManagement.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Button variant="outline" onClick={handleExportData}>
                {t.settings.dataManagement.exportData}
              </Button>

              <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" onClick={() => setResetDialogOpen(true)}>
                    {t.settings.dataManagement.resetAllData}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.settings.dataManagement.resetConfirmTitle}</AlertDialogTitle>
                    <AlertDialogDescription>{t.settings.dataManagement.resetConfirmDescription}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setResetDialogOpen(false)}>
                      {t.settings.dataManagement.cancel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onResetAllData()
                        setResetDialogOpen(false)
                      }}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {t.settings.dataManagement.confirm}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
