'use client'

import { useState, useMemo } from 'react'
import { FiSearch, FiX, FiPlus } from 'react-icons/fi'
import { mockMasterPriceList, type MasterPriceItem, type MasterPriceItemType } from '@/data/mockData'
import { labelClass, inputClass } from './settingsTypes'

function AddEditPriceItemModal({
  item,
  onClose,
  onSave,
}: {
  item: MasterPriceItem | null
  onClose: () => void
  onSave: (item: Omit<MasterPriceItem, 'id'>) => void
}) {
  const [type, setType] = useState<MasterPriceItemType>(item?.type ?? 'service')
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [cost, setCost] = useState(item?.cost ?? 0)
  const [markupPercent, setMarkupPercent] = useState(item?.markupPercent ?? 0)
  const [price, setPrice] = useState(item?.price ?? 0)

  const updatePriceFromMarkup = () => {
    const p = cost * (1 + markupPercent / 100)
    setPrice(Number(p.toFixed(2)))
  }

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      type,
      name: name.trim(),
      description: description.trim(),
      cost: Number(cost) || 0,
      markupPercent: Number(markupPercent) || 0,
      price: Number(price) || 0,
    })
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
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Item type</label>
            <select value={type} onChange={(e) => setType(e.target.value as MasterPriceItemType)} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
              <option value="service">Service</option>
              <option value="product">Product</option>
            </select>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Item name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Exterior Window Cleaning" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass} style={{ color: '#1F271B' }}>Cost</label>
              <input type="number" min={0} step={0.01} value={cost || ''} onChange={(e) => setCost(Number(e.target.value) || 0)} onBlur={updatePriceFromMarkup} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            </div>
            <div>
              <label className={labelClass} style={{ color: '#1F271B' }}>Markup %</label>
              <input type="number" min={0} step={0.01} value={markupPercent || ''} onChange={(e) => setMarkupPercent(Number(e.target.value) || 0)} onBlur={updatePriceFromMarkup} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            </div>
            <div>
              <label className={labelClass} style={{ color: '#1F271B' }}>Price</label>
              <input type="number" min={0} step={0.01} value={price || ''} onChange={(e) => setPrice(Number(e.target.value) || 0)} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="px-4 py-2 rounded text-sm text-white" style={{ backgroundColor: '#28AFB0' }}>
            {item ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ServicesSettings() {
  const [items, setItems] = useState<MasterPriceItem[]>(() => [...mockMasterPriceList])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'type'>('name')
  const [sortAsc, setSortAsc] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [importOpen, setImportOpen] = useState(false)

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

  const openAdd = () => { setEditingId(null); setModalOpen(true) }
  const openEdit = (id: number) => { setEditingId(id); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditingId(null) }

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
            Import
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
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr className="border-b" style={{ borderColor: '#EAEBED' }}>
                <td className="px-4 py-8 text-sm text-center" style={{ color: '#1F271B', opacity: 0.6 }} colSpan={6}>
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
                  <td className="px-4 py-3 text-sm text-right" style={{ color: '#1F271B' }}>Rs{item.cost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: '#1F271B' }}>{item.markupPercent}%</td>
                  <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: '#1F271B' }}>Rs{item.price.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <AddEditPriceItemModal
          item={editingId != null ? items.find((i) => i.id === editingId) ?? null : null}
          onClose={closeModal}
          onSave={(next) => {
            if (editingId != null) {
              setItems((prev) => prev.map((i) => (i.id === editingId ? { ...next, id: i.id } : i)))
            } else {
              setItems((prev) => [...prev, { ...next, id: Math.max(0, ...prev.map((i) => i.id)) + 1 }])
            }
            closeModal()
          }}
        />
      )}

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" style={{ borderColor: '#EAEBED', border: '1px solid #EAEBED' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#1F271B' }}>Import price list</h3>
            <p className="text-sm mb-4" style={{ color: '#1F271B', opacity: 0.7 }}>
              Upload a CSV with columns: type, name, description, cost, markupPercent, price. Type must be &quot;service&quot; or &quot;product&quot;.
            </p>
            <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: '#EAEBED' }}>
              <input type="file" accept=".csv" className="hidden" id="import-csv" />
              <label htmlFor="import-csv" className="cursor-pointer text-sm font-medium" style={{ color: '#28AFB0' }}>
                Select CSV file
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setImportOpen(false)} className="px-4 py-2 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
                Cancel
              </button>
              <button type="button" className="px-4 py-2 rounded text-sm text-white" style={{ backgroundColor: '#28AFB0' }}>
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
