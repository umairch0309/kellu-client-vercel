'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { FiSearch, FiX, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { labelClass, inputClass } from './settingsTypes'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PRICE_LIST_UPDATED_EVENT } from '@/lib/priceListEvents'
import { formatUsd } from '@/lib/formatCurrency'

/** Table row / modal item (id may be string from API) */
export type PriceListItem = {
  id: number | string
  type: 'service' | 'product'
  name: string
  description: string
  cost: number
  markupPercent: number
  price: number
}

/** Payload for POST /api/price-list (name and price required; rest optional) */
export type AddPriceItemPayload = {
  name: string
  price: number
  itemType?: 'SERVICE' | 'PRODUCT'
  description?: string | null
  cost?: number | null
  markupPercent?: number | null
}

function extractPriceList(json: unknown): unknown[] {
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

function normalizePriceItem(raw: Record<string, unknown>): PriceListItem {
  const id = raw.id ?? ''
  const itemType = typeof raw.itemType === 'string' ? raw.itemType.toUpperCase() : 'SERVICE'
  const type: 'service' | 'product' = itemType === 'PRODUCT' ? 'product' : 'service'
  const name = typeof raw.name === 'string' ? raw.name : '—'
  const description = typeof raw.description === 'string' ? raw.description : (raw.description == null ? '' : String(raw.description))
  const cost = typeof raw.cost === 'number' ? raw.cost : (typeof raw.cost === 'string' ? parseFloat(raw.cost) || 0 : 0)
  const markupPercent = typeof raw.markupPercent === 'number' ? raw.markupPercent : (typeof raw.markupPercent === 'string' ? parseFloat(raw.markupPercent) || 0 : 0)
  const price = typeof raw.price === 'number' ? raw.price : (typeof raw.price === 'string' ? parseFloat(raw.price) || 0 : 0)
  return {
    id: typeof id === 'string' ? id : (typeof id === 'number' ? id : String(id)),
    type,
    name,
    description,
    cost,
    markupPercent,
    price,
  }
}

function AddEditPriceItemModal({
  item,
  onClose,
  onSaveEdit,
  onSaveAdd,
  loading,
  error,
}: {
  item: PriceListItem | null
  onClose: () => void
  onSaveEdit?: (id: number | string, payload: AddPriceItemPayload) => void
  onSaveAdd?: (payload: AddPriceItemPayload) => void
  loading?: boolean
  error?: string | null
}) {
  const [type, setType] = useState<'service' | 'product'>(item?.type ?? 'service')
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [cost, setCost] = useState(item?.cost ?? 0)
  const [markupPercent, setMarkupPercent] = useState(item?.markupPercent ?? 0)
  const [price, setPrice] = useState(item?.price ?? 0)

  const isAdd = !item
  const updatePriceFromMarkup = () => {
    const p = cost * (1 + markupPercent / 100)
    setPrice(Number(p.toFixed(2)))
  }

  const handleSave = () => {
    const nameTrim = name.trim()
    const priceNum = Number(price)
    if (!nameTrim) return
    if (isAdd) {
      if (Number.isNaN(priceNum) || priceNum < 0) return
      if (!onSaveAdd) return
      onSaveAdd?.({
        name: nameTrim,
        price: priceNum,
        itemType: type === 'product' ? 'PRODUCT' : 'SERVICE',
        description: description.trim() || undefined,
        cost: Number(cost) ?? undefined,
        markupPercent: Number(markupPercent) ?? undefined,
      })
    } else {
      if (!item || !onSaveEdit) return
      onSaveEdit(item.id, {
        name: nameTrim,
        price: Number.isNaN(priceNum) ? 0 : priceNum,
        itemType: type === 'product' ? 'PRODUCT' : 'SERVICE',
        description: description.trim() || undefined,
        cost: Number(cost) ?? undefined,
        markupPercent: Number(markupPercent) ?? undefined,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" style={{ borderColor: '#EAEBED', border: '1px solid #EAEBED' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: '#1F271B' }}>{item ? 'Edit item' : 'Add item'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded hover:bg-gray-100" style={{ color: '#1F271B' }}>
            <FiX size={20} />
          </button>
        </div>
        <div className="space-y-4">
          {error && (
            <div className="px-3 py-2 rounded text-sm bg-red-50 border border-red-200" style={{ color: '#B91C1C' }}>{error}</div>
          )}
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Item type <span style={{ opacity: 0.6 }}>(Optional)</span></label>
            <select value={type} onChange={(e) => setType(e.target.value as 'service' | 'product')} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
              <option value="service">Service</option>
              <option value="product">Product</option>
            </select>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Item name <span style={{ color: '#B91C1C' }}>*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Exterior Window Cleaning" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Description <span style={{ opacity: 0.6 }}>(Optional)</span></label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass} style={{ color: '#1F271B' }}>Cost <span style={{ opacity: 0.6 }}>(Optional)</span></label>
              <input type="number" min={0} step={0.01} value={cost || ''} onChange={(e) => setCost(Number(e.target.value) || 0)} onBlur={updatePriceFromMarkup} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            </div>
            <div>
              <label className={labelClass} style={{ color: '#1F271B' }}>Markup % <span style={{ opacity: 0.6 }}>(Optional)</span></label>
              <input type="number" min={0} step={0.01} value={markupPercent || ''} onChange={(e) => setMarkupPercent(Number(e.target.value) || 0)} onBlur={updatePriceFromMarkup} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            </div>
            <div>
              <label className={labelClass} style={{ color: '#1F271B' }}>Price <span style={{ color: '#B91C1C' }}>*</span></label>
              <input type="number" min={0} step={0.01} value={price || ''} onChange={(e) => setPrice(Number(e.target.value) || 0)} required={isAdd} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={loading} className="px-4 py-2 rounded text-sm text-white disabled:opacity-70" style={{ backgroundColor: '#28AFB0' }}>
            {loading ? 'Saving…' : item ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ServicesSettings() {
  const [items, setItems] = useState<PriceListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'type'>('name')
  const [sortAsc, setSortAsc] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [addItemLoading, setAddItemLoading] = useState(false)
  const [addItemError, setAddItemError] = useState<string | null>(null)
  const [updateItemLoading, setUpdateItemLoading] = useState(false)
  const [updateItemError, setUpdateItemError] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<PriceListItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const fetchPriceList = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setLoading(true)
    setError(null)
    fetch(`${baseUrl}/api/price-list`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        return res.json()
      })
      .then((json: unknown) => {
        const rawList = extractPriceList(json)
        const list = rawList
          .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
          .map((item) => normalizePriceItem(item))
        setItems(list)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load price list')
        setItems([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchPriceList() }, [fetchPriceList])

  useEffect(() => {
    const onPriceListUpdated = () => {
      fetchPriceList()
    }
    window.addEventListener(PRICE_LIST_UPDATED_EVENT, onPriceListUpdated)
    return () => window.removeEventListener(PRICE_LIST_UPDATED_EVENT, onPriceListUpdated)
  }, [fetchPriceList])

  const handleAddItem = useCallback(async (payload: AddPriceItemPayload) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setAddItemError(null)
    setAddItemLoading(true)
    try {
      const body: Record<string, unknown> = {
        name: payload.name,
        price: payload.price,
      }
      if (payload.itemType != null) body.itemType = payload.itemType
      if (payload.description != null && payload.description !== '') body.description = payload.description
      if (payload.cost != null) body.cost = payload.cost
      if (payload.markupPercent != null) body.markupPercent = payload.markupPercent
      const res = await fetch(`${baseUrl}/api/price-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = (data as { message?: string }).message ?? `Request failed (${res.status})`
        setAddItemError(message)
        return
      }
      fetchPriceList()
      setModalOpen(false)
      setEditingId(null)
    } catch (err) {
      setAddItemError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setAddItemLoading(false)
    }
  }, [fetchPriceList])

  const handleUpdateItem = useCallback(async (id: number | string, payload: AddPriceItemPayload) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setUpdateItemError(null)
    setUpdateItemLoading(true)
    try {
      const body: Record<string, unknown> = {
        name: payload.name,
        price: payload.price,
      }
      if (payload.itemType != null) body.itemType = payload.itemType
      if (payload.description != null && payload.description !== '') body.description = payload.description
      if (payload.cost != null) body.cost = payload.cost
      if (payload.markupPercent != null) body.markupPercent = payload.markupPercent
      const res = await fetch(`${baseUrl}/api/price-list/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = (data as { message?: string }).message ?? `Request failed (${res.status})`
        setUpdateItemError(message)
        return
      }
      fetchPriceList()
      setModalOpen(false)
      setEditingId(null)
    } catch (err) {
      setUpdateItemError(err instanceof Error ? err.message : 'Failed to update item')
    } finally {
      setUpdateItemLoading(false)
    }
  }, [fetchPriceList])

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) return
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setDeleteLoading(true)
    try {
      const res = await fetch(`${baseUrl}/api/price-list/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const message = (data as { message?: string }).message ?? `Request failed (${res.status})`
        setDeleteLoading(false)
        return
      }
      fetchPriceList()
      setItemToDelete(null)
    } catch {
      setDeleteLoading(false)
    } finally {
      setDeleteLoading(false)
    }
  }, [itemToDelete, fetchPriceList])

  const handleImportSubmit = useCallback(async () => {
    if (!importFile) return
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setImportError(null)
    setImportLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', importFile)
      const res = await fetch(`${baseUrl}/api/price-list/import`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = (json as { message?: string }).message ?? `Request failed (${res.status})`
        setImportError(message)
        return
      }
      const data = json as { success?: boolean; data?: { created?: number } }
      const created = data?.data?.created ?? 0
      fetchPriceList()
      setImportOpen(false)
      setImportFile(null)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import CSV')
    } finally {
      setImportLoading(false)
    }
  }, [importFile, fetchPriceList])

  const closeImportModal = useCallback(() => {
    setImportOpen(false)
    setImportFile(null)
    setImportError(null)
  }, [])

  const filtered = useMemo(() => {
    let list = items.filter(
      (i) =>
        !search ||
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        (i.description && i.description.toLowerCase().includes(search.toLowerCase())) ||
        i.type.toLowerCase().includes(search.toLowerCase())
    )
    list = [...list].sort((a, b) => {
      const mul = sortAsc ? 1 : -1
      if (sortBy === 'name') return mul * (a.name.localeCompare(b.name))
      return mul * (a.type.localeCompare(b.type))
    })
    return list
  }, [items, search, sortBy, sortAsc])

  const toggleSort = (field: 'name' | 'type') => {
    if (sortBy === field) setSortAsc((a) => !a)
    else { setSortBy(field); setSortAsc(true) }
  }

  const openAdd = () => { setEditingId(null); setAddItemError(null); setModalOpen(true) }
  const openEdit = (id: number | string) => { setEditingId(id); setUpdateItemError(null); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditingId(null); setAddItemError(null); setUpdateItemError(null) }

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Products & services</h1>
        <p className="text-sm mt-1" style={{ color: '#1F271B', opacity: 0.7 }}>
          Add and update your products & services to stay organized when creating quotes, quote templates, jobs, and invoices. You can also add new custom services from a work order to the master price list.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} style={{ color: '#1F271B', opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 border rounded text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: '#EAEBED', color: '#1F271B' }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/5"
              style={{ color: '#1F271B', opacity: 0.6 }}
              aria-label="Clear search"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="px-4 py-2 border rounded text-sm font-medium transition-colors"
            style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
          >
            Import CSV
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="px-4 py-2 rounded text-sm font-medium flex items-center gap-1.5 text-white transition-colors"
            style={{ backgroundColor: '#28AFB0' }}
          >
            <FiPlus size={16} />
            Add Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
        <TooltipProvider delayDuration={200}>
        <table className="w-full">
          <thead style={{ backgroundColor: '#F3F4F6' }}>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>
                <button type="button" onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:opacity-80">
                  Name
                  <span className="text-xs opacity-60">{sortBy === 'name' ? (sortAsc ? '↑' : '↓') : ''}</span>
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>Description</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>
                <button type="button" onClick={() => toggleSort('type')} className="flex items-center gap-1 hover:opacity-80">
                  Type
                  <span className="text-xs opacity-60">{sortBy === 'type' ? (sortAsc ? '↑' : '↓') : ''}</span>
                </button>
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#1F271B' }}>Cost</th>
              <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#1F271B' }}>Markup %</th>
              <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#1F271B' }}>Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold w-24" style={{ color: '#1F271B' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="border-b" style={{ borderColor: '#EAEBED' }}>
                <td className="px-4 py-8 text-sm text-center" style={{ color: '#1F271B', opacity: 0.7 }} colSpan={7}>Loading price list…</td>
              </tr>
            ) : error ? (
              <tr className="border-b" style={{ borderColor: '#EAEBED' }}>
                <td className="px-4 py-8 text-center" colSpan={7}>
                  <p className="text-sm mb-2" style={{ color: '#B91C1C' }}>{error}</p>
                  <button type="button" onClick={() => fetchPriceList()} className="px-3 py-1.5 rounded text-sm text-white" style={{ backgroundColor: '#28AFB0' }}>Try again</button>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr className="border-b" style={{ borderColor: '#EAEBED' }}>
                <td className="px-4 py-8 text-sm text-center" style={{ color: '#1F271B', opacity: 0.6 }} colSpan={7}>
                  No items yet. Add items or import to build your master price list.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openEdit(item.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEdit(item.id) } }}
                  className="border-b cursor-pointer transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#EAEBED' }}
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium" style={{ color: '#2B50AA' }}>{item.name}</span>
                  </td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate" style={{ color: '#1F271B', opacity: 0.8 }} title={item.description}>
                    {item.description || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#1F271B' }}>{item.type === 'service' ? 'Service' : 'Product'}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: '#1F271B' }}>{formatUsd(Number(item.cost))}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: '#1F271B' }}>{Number(item.markupPercent)}%</td>
                  <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: '#1F271B' }}>{formatUsd(Number(item.price))}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => openEdit(item.id)}
                            className="p-1.5 rounded transition-colors hover:opacity-90"
                            style={{ color: '#28AFB0' }}
                            aria-label="Edit item"
                          >
                            <FiEdit2 size={18} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="z-[100]">Edit item</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 rounded hover:bg-red-50 transition-colors"
                            style={{ color: '#B91C1C' }}
                            aria-label="Delete item"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="z-[100]">Delete item</TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </TooltipProvider>
      </div>

      <Dialog open={!!itemToDelete} onOpenChange={(open) => { if (!open) setItemToDelete(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{itemToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setItemToDelete(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {modalOpen && (
        <AddEditPriceItemModal
          item={editingId != null ? items.find((i) => i.id === editingId) ?? null : null}
          onClose={closeModal}
          onSaveEdit={editingId != null ? handleUpdateItem : undefined}
          onSaveAdd={editingId == null ? handleAddItem : undefined}
          loading={addItemLoading || updateItemLoading}
          error={addItemError || updateItemError}
        />
      )}

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" style={{ borderColor: '#EAEBED', border: '1px solid #EAEBED' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#1F271B' }}>Import price list</h3>
            <p className="text-sm mb-4" style={{ color: '#1F271B', opacity: 0.7 }}>
              Upload a CSV with columns: type, name, description, cost, markupPercent, price. Type must be &quot;service&quot; or &quot;product&quot;.
            </p>
            {importError && (
              <div className="mb-4 px-3 py-2 rounded text-sm bg-red-50 border border-red-200" style={{ color: '#B91C1C' }}>{importError}</div>
            )}
            <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: '#EAEBED' }}>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                id="import-csv"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              />
              <label htmlFor="import-csv" className="cursor-pointer text-sm font-medium" style={{ color: '#28AFB0' }}>
                Select CSV file
              </label>
              {importFile && (
                <p className="text-sm mt-2" style={{ color: '#1F271B', opacity: 0.8 }}>{importFile.name}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={closeImportModal} disabled={importLoading} className="px-4 py-2 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={!importFile || importLoading}
                className="px-4 py-2 rounded text-sm text-white disabled:opacity-70"
                style={{ backgroundColor: '#28AFB0' }}
              >
                {importLoading ? 'Importing…' : 'Import CSV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
