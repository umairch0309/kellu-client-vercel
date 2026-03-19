/**
 * Shared parsing for GET /api/clients (same shapes as ClientsList).
 */

export type ApiClientOption = {
  id: string | number
  name: string
  address?: string
  phone?: string
  email?: string
}

/** Extract client array from various API response shapes */
export function extractClientsList(json: unknown): unknown[] {
  if (Array.isArray(json)) return json
  if (json && typeof json === 'object') {
    const obj = json as Record<string, unknown>
    const inner = obj.data
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      const innerObj = inner as Record<string, unknown>
      if (Array.isArray(innerObj.data)) return innerObj.data
    }
    if (Array.isArray(obj.data)) return obj.data
    if (Array.isArray(obj.clients)) return obj.clients
    if (Array.isArray(obj.results)) return obj.results
    if (Array.isArray(obj.items)) return obj.items
  }
  return []
}

export function normalizeApiClientOption(raw: Record<string, unknown>): ApiClientOption {
  const rawId = raw.id ?? raw.client_id
  const id = typeof rawId === 'string' ? rawId : typeof rawId === 'number' ? rawId : String(rawId)
  const name =
    typeof raw.name === 'string'
      ? raw.name
      : [raw.first_name, raw.last_name].some((v) => typeof v === 'string')
        ? [raw.first_name, raw.last_name]
            .filter((v) => typeof v === 'string')
            .join(' ')
            .trim() || '—'
        : ''
  const phone =
    typeof raw.phone === 'string' ? raw.phone : typeof raw.phone_number === 'string' ? raw.phone_number : ''
  const address =
    typeof raw.address === 'string'
      ? raw.address
      : typeof raw.address_line === 'string'
        ? raw.address_line
        : undefined
  const email = typeof raw.email === 'string' ? raw.email : undefined
  return {
    id,
    name: name || '—',
    phone: phone || undefined,
    address: address || undefined,
    email,
  }
}
