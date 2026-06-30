// lib/mockData.ts
// Mock product catalogue has been removed now that the store runs on
// real Supabase data. This file only keeps small shared helpers used
// across the app (price formatting, etc.).

export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
