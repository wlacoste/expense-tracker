"use client"

import { useEffect } from "react"
import type { Reserve } from "@/components/transactions-reserves-tab"
import type { Income } from "@/components/transactions-income-tab"
import { calculateTotalInterest } from "@/lib/utils"

/**
 * Hook that automatically deletes reserves that have passed their dissolution date by at least a day
 * If the reserve had interest, it adds a new income entry for the interest earned
 *
 * @param reserves - Array of reserves to check
 * @param onDeleteReserve - Function to call to delete a reserve
 * @param onAddIncome - Function to call to add a new income for the interest earned
 */
export function useAutoDeleteExpiredReserves(
  reserves: Reserve[],
  onDeleteReserve: (id: string) => void,
  onAddIncome: (income: Income) => void,
) {
  useEffect(() => {
    // Function to check if reserves should be deleted
    const checkExpiredReserves = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day

      // Yesterday's date (24 hours ago)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      reserves.forEach((reserve) => {
        // Only check reserves that have a dissolution date
        if (reserve.dissolutionDate) {
          const dissolutionDate = new Date(reserve.dissolutionDate)
          dissolutionDate.setHours(0, 0, 0, 0) // Reset time to start of day

          // Check if dissolution date has passed by at least a day
          if (dissolutionDate <= yesterday) {
            // If the reserve had an interest rate, add a new income for the interest earned
            if (reserve.interestRate && reserve.interestRate > 0) {
              const interestAmount = calculateTotalInterest(reserve)

              // Only add income if there was actual interest earned
              if (interestAmount > 0) {
                // Create a new income entry for the interest
                const newIncome: Income = {
                  id: `interest-${reserve.id}-${Date.now()}`,
                  date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
                  amount: interestAmount,
                  description: `Interest from reserve: ${reserve.description ? reserve.description: reserve.amount}`,
                }

                // Add the new income
                onAddIncome(newIncome)
              }
            }

            // Delete the reserve
            onDeleteReserve(reserve.id)
          }
        }
      })
    }

    // Run the check when the component mounts and whenever reserves change
    checkExpiredReserves()

    // No cleanup needed as we're not setting up any subscriptions or timers
  }, [reserves, onDeleteReserve, onAddIncome])

  // This hook doesn't return anything
}
