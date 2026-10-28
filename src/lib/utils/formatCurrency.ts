export type Currency = 'PLN' | 'EUR'

export function formatCurrency(amount: number, currency: Currency = 'PLN'): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatAmount(amount: number): string {
  return amount.toFixed(2)
}
