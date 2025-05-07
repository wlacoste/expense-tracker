"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MonthSelectorProps {
  selectedMonth: string
  onMonthChange: (month: string) => void
}

export default function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number)
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    onMonthChange(`${prevYear}-${String(prevMonth).padStart(2, "0")}`)
  }

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number)
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    onMonthChange(`${nextYear}-${String(nextMonth).padStart(2, "0")}`)
  }

  const formatDate = (dateString: string): string => {
    const [year, month] = dateString.split("-").map(Number)
    const date = new Date(year, month - 1, 1)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    })
  }

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="icon" onClick={handlePrevMonth}>
        <ChevronLeftIcon className="h-4 w-4" />
        <span className="sr-only">Previous month</span>
      </Button>
      <span className="font-medium">{formatDate(selectedMonth)}</span>
      <Button variant="outline" size="icon" onClick={handleNextMonth}>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="sr-only">Next month</span>
      </Button>
    </div>
  )
}
