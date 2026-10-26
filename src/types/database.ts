export type CategoryType = 'regular' | 'subscriptions' | 'income' | 'other'

export interface Category {
  id: string
  user_id: string
  name: string
  type: CategoryType
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  category_id: string
  amount: number
  comment: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  category_id: string
  name: string
  amount: number
  active: boolean
  created_at: string
}

export interface SummaryCategory {
  id: string
  name: string
  type: CategoryType
  total: number
  percentage: number
}

export interface SummaryResponse {
  period: 'week' | 'month' | 'year'
  startDate: string
  endDate: string
  totalSpent: number
  totalIncome: number
  categories: SummaryCategory[]
}
