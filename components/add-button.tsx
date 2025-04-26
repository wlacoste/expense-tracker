"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, ArrowUpIcon, ArrowDownIcon, FolderIcon } from "lucide-react"
import { getTranslations } from "@/lib/translations"

interface AddButtonProps {
  onAddExpense: () => void
  onAddIncome: () => void
  onAddCategory: () => void
  language: string
}

export default function AddButton({ onAddExpense, onAddIncome, onAddCategory,  language,
}: AddButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const t = getTranslations(language as any)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleAddExpense = () => {
    onAddExpense()
    setIsOpen(false)
  }

  const handleAddIncome = () => {
    onAddIncome()
    setIsOpen(false)
  }

  const handleAddCategory = () => {
    onAddCategory()
    setIsOpen(false)
  }

  return (
    <>
      {/* Child buttons with animations */}
      <div
        className={`fixed right-4 bottom-40 flex flex-col items-end gap-2 z-20 transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <Button
          className="h-12 w-40 px-4 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300 ease-in-out"
          onClick={handleAddIncome}
          style={{
            transitionDelay: isOpen ? "0ms" : "200ms",
          }}
        >
          <ArrowUpIcon className="h-5 w-5 text-green-500" />
          <span>{t.dashboard.addIncome}</span>
          </Button>

        <Button
          className="h-12 w-40 px-4 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300 ease-in-out"
          onClick={handleAddExpense}
          style={{
            transitionDelay: isOpen ? "100ms" : "100ms",
          }}
        >
          <ArrowDownIcon className="h-5 w-5 text-red-500" />
          <span>{t.dashboard.addExpense}</span>
          </Button>

        <Button
          className="h-12 w-40 px-4 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300 ease-in-out"
          onClick={handleAddCategory}
          style={{
            transitionDelay: isOpen ? "200ms" : "0ms",
          }}
        >
          <FolderIcon className="h-5 w-5 text-blue-500" />
          <span>{t.dashboard.addCategory}</span>
          </Button>
      </div>

      {/* Main FAB button - in a separate container */}
      <div className="fixed right-4 bottom-24 z-20">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:scale-105"
          onClick={toggleMenu}
        >
          <Plus className={`h-20 w-20 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
          <span className="sr-only">{t.dashboard.addLabel}</span>
        </Button>
      </div>
    </>
  )
}
