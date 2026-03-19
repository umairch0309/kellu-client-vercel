/**
 * Shared parsing for GET /api/price-list (same shapes as ServicesSettings).
 */

export type PriceListSelectItem = {
  id: number | string
  type: 'service' | 'product'
  name: string
  description: string
  price: number
}

export function extractPriceList(json: unknown): unknown[] {
  if (json == null || typeof json !== 'object') return []
  const obj = json as Record<string, unknown>
  const data = obj.data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).data
    if (Array.isArray(inner)) return inner
  }
  if (Array.isArray(data)) return data
  return []
}

export function normalizePriceListSelectItem(raw: Record<string, unknown>): PriceListSelectItem {
  const id = raw.id ?? ''
  const itemType = typeof raw.itemType === 'string' ? raw.itemType.toUpperCase() : 'SERVICE'
  const type: 'service' | 'product' = itemType === 'PRODUCT' ? 'product' : 'service'
  const name = typeof raw.name === 'string' ? raw.name : '—'
  const description =
    typeof raw.description === 'string'
      ? raw.description
      : raw.description == null
        ? ''
        : String(raw.description)
  const price =
    typeof raw.price === 'number' ? raw.price : typeof raw.price === 'string' ? parseFloat(raw.price) || 0 : 0
  return {
    id: typeof id === 'string' ? id : typeof id === 'number' ? id : String(id),
    type,
    name,
    description,
    price,
  }
}
