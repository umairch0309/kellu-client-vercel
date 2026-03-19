/**
 * USD display helpers (en-US).
 */

export function formatUsd(
  amount: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
): string {
  const n = Number.isFinite(amount) ? amount : 0
  const min = options?.minimumFractionDigits ?? 2
  const max = options?.maximumFractionDigits ?? 2
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  }).format(n)
}

/** For overview chips: "$1.2k" when ≥ 1000, else whole dollars. */
export function formatUsdCompact(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0
  if (Math.abs(n) >= 1000) {
    const k = n / 1000
    const sign = k < 0 ? '-' : ''
    return `${sign}$${Math.abs(k).toFixed(1)}k`
  }
  return formatUsd(n, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
