"use client"

import { useRef, useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SelectOption {
  value: string
  label: string
}

interface ScrollableSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  currentOption: SelectOption
  placeholder?: string
  className?: string
}

export function ScrollableSelect({
  value,
  onValueChange,
  options,
  currentOption,
  placeholder = "Select month",
  className,
}: ScrollableSelectProps) {
  const selectedItemRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Handle scrolling to the selected item when the dropdown opens
  useEffect(() => {
    if (isOpen && selectedItemRef.current) {
      // Use a small timeout to ensure the dropdown is fully rendered
      setTimeout(() => {
        selectedItemRef.current?.scrollIntoView({
          behavior: "auto",
          block: "start",
        })
      }, 10)
    }
  }, [isOpen])

  return (
    <Select value={value} onValueChange={onValueChange} onOpenChange={setIsOpen}>
      <SelectTrigger className={`w-[180px] ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            ref={option.value === value ? selectedItemRef : undefined}
            className={option.value === currentOption.value ? "font-bold" : ""}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
