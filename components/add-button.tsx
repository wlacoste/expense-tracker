"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, ArrowUpIcon, ArrowDownIcon } from "lucide-react"

interface AddButtonProps {
  onAddExpense: () => void
  onAddIncome: () => void
}

export default function AddButton({ onAddExpense, onAddIncome }: AddButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

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

  return (
    <div className="fixed right-4 bottom-20 flex flex-col items-end gap-3 z-20">
      {/* Child buttons with animations - now above the main button */}
      <div
        className={`flex flex-col gap-2 items-end transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <Button
          className="h-12 w-40 px-4 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300 ease-in-out"
          onClick={handleAddIncome}
          style={{
            transitionDelay: isOpen ? "0ms" : "150ms",
          }}
        >
          <ArrowUpIcon className="h-5 w-5 text-green-500" />
          <span>Add Income</span>
        </Button>

        <Button
          className="h-12 w-40 px-4 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300 ease-in-out"
          onClick={handleAddExpense}
          style={{
            transitionDelay: isOpen ? "150ms" : "0ms",
          }}
        >
          <ArrowDownIcon className="h-5 w-5 text-red-500" />
          <span>Add Expense</span>
        </Button>
      </div>

      {/* Main FAB button */}
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:scale-105"
        onClick={toggleMenu}
      >
        <Plus className={`h-20 w-20 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
        <span className="sr-only">Add</span>
      </Button>
    </div>
  )
}
