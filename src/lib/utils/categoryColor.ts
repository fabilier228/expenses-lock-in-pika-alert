const CATEGORY_COLORS = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
]

/** Returns the same color for a category anywhere it appears in the app. */
export function getCategoryColor(categoryId: string): string {
  let hash = 0
  for (let i = 0; i < categoryId.length; i += 1) {
    hash = (hash * 31 + categoryId.charCodeAt(i)) >>> 0
  }
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length]
}
