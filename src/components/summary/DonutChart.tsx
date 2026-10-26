'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { SummaryCategory } from '@/types/database'
import { formatCurrency } from '@/lib/utils/formatCurrency'

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
]

interface DonutChartProps {
  categories: SummaryCategory[]
}

export function DonutChart({ categories }: DonutChartProps) {
  if (categories.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        No data for this period
      </div>
    )
  }

  const data = categories.map((c) => ({ name: c.name, value: c.total }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-gray-500">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
