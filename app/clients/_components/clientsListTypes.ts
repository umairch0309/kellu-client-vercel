export type NameSortOption = 'first-az' | 'first-za' | 'last-az' | 'last-za'
export type LastActivitySortOption = 'newest' | 'oldest'

export interface ClientListItem {
  id: number | string
  name: string
  phone: string
  email?: string
  address?: string
  lastActivity: string
  status: string
  lastActivityAt?: string
}

/** Color-code status for badges (Active/ACTIVE=teal, Follow Up=purple, Archive=gray) */
export function getStatusBadgeStyle(status: string): { backgroundColor: string; color: string; dotColor: string } {
  const s = status.toLowerCase()
  if (s === 'active') return { backgroundColor: 'rgba(40, 175, 176, 0.2)', color: '#1E8A8B', dotColor: '#1E8A8B' }
  if (s === 'follow up' || s === 'follow-up') return { backgroundColor: 'rgba(176, 132, 204, 0.2)', color: '#8B6AA3', dotColor: '#8B6AA3' }
  if (s === 'archive' || s === 'archived') return { backgroundColor: '#F3F4F6', color: '#6B7280', dotColor: '#6B7280' }
  return { backgroundColor: '#F3F4F6', color: '#1F271B', dotColor: '#1F271B' }
}
