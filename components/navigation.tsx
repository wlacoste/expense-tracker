"use client"

import { BarChart2, Home, Settings, CreditCard } from "lucide-react"

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around p-2 z-10">
      <button
        className={`flex flex-col items-center justify-center p-2 rounded-md ${
          activeTab === "dashboard" ? "text-primary" : "text-muted-foreground"
        }`}
        onClick={() => setActiveTab("dashboard")}
      >
        <Home className="h-5 w-5" />
        <span className="text-xs mt-1">Dashboard</span>
      </button>

      <button
        className={`flex flex-col items-center justify-center p-2 rounded-md ${
          activeTab === "transactions" ? "text-primary" : "text-muted-foreground"
        }`}
        onClick={() => setActiveTab("transactions")}
      >
        <CreditCard className="h-5 w-5" />
        <span className="text-xs mt-1">Transactions</span>
      </button>

      <button
        className={`flex flex-col items-center justify-center p-2 rounded-md ${
          activeTab === "analytics" ? "text-primary" : "text-muted-foreground"
        }`}
        onClick={() => setActiveTab("analytics")}
      >
        <BarChart2 className="h-5 w-5" />
        <span className="text-xs mt-1">Analytics</span>
      </button>

      <button
        className={`flex flex-col items-center justify-center p-2 rounded-md ${
          activeTab === "settings" ? "text-primary" : "text-muted-foreground"
        }`}
        onClick={() => setActiveTab("settings")}
      >
        <Settings className="h-5 w-5" />
        <span className="text-xs mt-1">Settings</span>
      </button>
    </div>
  )
}
