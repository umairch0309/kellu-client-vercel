export type SettingsSection = 'company' | 'schedule' | 'products' | 'communications' | 'team' | 'roles'

export const SIDEBAR_ITEMS: { id: SettingsSection; label: string }[] = [
  { id: 'company', label: 'Company Settings' },
  { id: 'schedule', label: 'Schedule Settings' },
  { id: 'products', label: 'Product and Services' },
  { id: 'communications', label: 'Communications Settings' },
  { id: 'team', label: 'Team Management' },
  { id: 'roles', label: 'Roles & Permissions' },
]

export type RoleDef = {
  id: string
  name: string
  description: string
  permissions: string[]
  isSystem: boolean
}

/** Matches the shape of each item in /api/roles/permissions/matrix data[] */
export type PermissionResource = {
  resource: string
  actions: string[]
}

export const inputClass = 'w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2'
export const labelClass = 'block text-sm font-medium mb-1'
export const sectionTitleClass = 'text-base font-semibold mb-3'

export const VALID_SECTIONS: SettingsSection[] = ['company', 'schedule', 'products', 'communications', 'team', 'roles']

export const LOCALE_STORAGE_KEY = 'appLocale'
export type AppLocale = 'en' | 'es'

export function getStoredLocale(): AppLocale {
  if (typeof window === 'undefined') return 'en'
  const v = localStorage.getItem(LOCALE_STORAGE_KEY)
  return v === 'es' ? 'es' : 'en'
}
