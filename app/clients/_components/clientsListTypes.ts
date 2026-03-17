export type NameSortOption = 'first-az' | 'first-za' | 'last-az' | 'last-za'
export type LastActivitySortOption = 'newest' | 'oldest'

export interface ClientListItem {
  id: number
  name: string
  phone: string
  email?: string
  address?: string
  lastActivity: string
  status: string
  lastActivityAt?: string
}
