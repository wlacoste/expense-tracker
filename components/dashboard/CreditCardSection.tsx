import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { formatCurrency } from "@/lib/utils"
import { AlertCircleIcon, ChevronDown, CreditCardIcon, StarIcon } from "lucide-react"
import type { CreditCardSectionProps } from "./types"
import { formatShortDate } from "./useDashboard"

export function CreditCardSection({
  creditCardMetrics,
  creditCardsExpanded,
  setCreditCardsExpanded,
  totalCreditCardExpensesThisMonth,
  totalExecutedCreditCardExpenses,
  totalPendingCreditCardExpenses,
  t,
  favoriteCreditCardId,
}: CreditCardSectionProps) {
  // Sort credit card metrics to show favorite first
  const sortedCreditCardMetrics = [...creditCardMetrics].sort((a, b) => {
    if (a.card.id === favoriteCreditCardId) return -1
    if (b.card.id === favoriteCreditCardId) return 1
    return a.card.description.localeCompare(b.card.description)
  })

  return (
    <>
      {/* Credit Card Expenses KPIs */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium">{t.dashboard.creditCard.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground text-right">{t.dashboard.creditCard.total}</div>
              <div className="text-xl font-bold text-right">{formatCurrency(totalCreditCardExpensesThisMonth)}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground text-right">{t.dashboard.creditCard.executed}</div>
              <div className="text-xl font-bold text-green-500 text-right">
                {formatCurrency(totalExecutedCreditCardExpenses)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground text-right">{t.dashboard.creditCard.pending}</div>
              <div className="text-xl font-bold text-amber-500 text-right">
                {formatCurrency(totalPendingCreditCardExpenses)}
              </div>
            </div>
          </div>

          {totalPendingCreditCardExpenses > 0 && (
            <div className="text-xs text-muted-foreground flex items-center">
              <AlertCircleIcon className="h-3 w-3 mr-1 text-amber-500" />
              {t.dashboard.creditCard.pendingWarning}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Cards Metrics */}
      {creditCardMetrics.length > 0 && (
        <Collapsible open={creditCardsExpanded} onOpenChange={setCreditCardsExpanded} className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{t.dashboard.creditCard.cards}</h2>
            <div>
              <CollapsibleTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${creditCardsExpanded ? "rotate-180" : ""}`}
                />
                <span className="sr-only">{t.dashboard.creditCard.toggle}</span>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent className="transition-all">
            <div className="w-full overflow-x-auto snap-x snap-mandatory pb-4 pt-2">
              <div className="flex space-x-4">
                {sortedCreditCardMetrics.map((metric) => (
                  <Card
                    key={metric.card.id}
                    className="min-w-[80%] sm:min-w-[calc(50%-0.5rem)] w-[80%] sm:w-[calc(50%-0.5rem)] flex-shrink-0 snap-center"
                  >
                    <CardHeader className="p-3 pb-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCardIcon className="h-4 w-4 mr-2 text-blue-500" />
                          <CardTitle className="text-base font-medium">
                            <div className="flex items-center">
                              <span className="capitalize">{metric.card.description}</span>
                              {metric.card.id === favoriteCreditCardId && (
                                <StarIcon className="h-3 w-3 ml-1 text-yellow-500" fill="currentColor" />
                              )}
                            </div>
                          </CardTitle>
                        </div>
                        {metric.pendingTotal > 0 && (
                          <div className="text-xs font-medium text-amber-500">
                            {formatCurrency(metric.pendingTotal)} {t.dashboard.creditCard.pendingSmall}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-[2px]">
                      {/* Current Period Section */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">{t.dashboard.creditCard.totalLabel}</div>
                          <div className="text-lg font-bold">{formatCurrency(metric.thisMonthTotal)}</div>
                        </div>
                        <div className="flex text-xs space-x-4 justify-end">
                          <div>
                            <span className="text-muted-foreground">{t.dashboard.creditCard.closing} </span>
                            <span className="font-medium">{formatShortDate(metric.thisMonthClosingDate)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground ml-2">{t.dashboard.creditCard.due} </span>
                            <span className="font-medium">{formatShortDate(metric.thisMonthDueDate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Upcoming Period Section */}
                      <div className="space-y-1">
                        <div className="text-xs font-medium">{t.dashboard.creditCard.upcoming}</div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-muted-foreground">{t.dashboard.creditCard.totalLabel}</div>
                          <div className="text-sm font-semibold">{formatCurrency(metric.nextMonthTotal)}</div>
                        </div>
                        <div className="flex text-xs space-x-4 justify-end">
                          <div>
                            <span className="text-muted-foreground">{t.dashboard.creditCard.closing} </span>
                            <span className="font-medium">{formatShortDate(metric.nextMonthClosingDate)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground ml-2">{t.dashboard.creditCard.due} </span>
                            <span className="font-medium">{formatShortDate(metric.nextMonthDueDate)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </>
  )
}
