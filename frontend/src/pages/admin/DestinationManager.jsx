import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiMapPin, FiTag, FiEye, FiEyeOff, FiX, FiCheck, FiClock, FiList } from 'react-icons/fi'
import RupeeIcon from '../../components/ui/RupeeIcon'
import toast from 'react-hot-toast'
import {
  getAdminDestinations,
  createAdminDestination,
  updateAdminDestination,
  deleteAdminDestination,
  getAdminPlaces,
  createAdminPlace,
  updateAdminPlace,
  deleteAdminPlace,
} from '../../api/adminApi'

const ALL_TRAVEL_TYPES = ['Adventure', 'Relaxation', 'Cultural', 'Road Trip', 'Beach', 'Wildlife', 'Family', 'Solo']

const emptyForm = {
  name: '',
  description: '',
  imageUrl: '',
  estimatedCost: '',
  travelTypes: [],
  isActive: true,
  sortOrder: 0,
  activeStartHour: 7,
  activeEndHour: 18,
}

export default function DestinationManager() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [placesData, setPlacesData] = useState({})
  const [expandedDest, setExpandedDest] = useState(null)
  const [placeForm, setPlaceForm] = useState({ name: '', description: '', imageUrl: '', timeRequired: '2', entryCost: '0', sortOrder: 0 })
  const [editingPlace, setEditingPlace] = useState(null)
  const [savingPlace, setSavingPlace] = useState(false)

  const loadPlaces = async (destId) => {
    try {
      const res = await getAdminPlaces(destId)
      setPlacesData((prev) => ({ ...prev, [destId]: res.data }))
    } catch {}
  }

  const toggleExpand = (destId) => {
    if (expandedDest === destId) {
      setExpandedDest(null)
    } else {
      setExpandedDest(destId)
      if (!placesData[destId]) loadPlaces(destId)
    }
  }

  const [showPlaceForm, setShowPlaceForm] = useState(false)

  const openPlaceForm = (place) => {
    if (place) {
      setEditingPlace(place.id)
      setPlaceForm({
        name: place.name || '',
        description: place.description || '',
        imageUrl: place.imageUrl || '',
        timeRequired: place.timeRequired?.toString() || '2',
        entryCost: place.entryCost?.toString() || '0',
        sortOrder: place.sortOrder || 0,
      })
    } else {
      setEditingPlace(null)
      setPlaceForm({ name: '', description: '', imageUrl: '', timeRequired: '2', entryCost: '0', sortOrder: 0 })
    }
    setShowPlaceForm(true)
  }

  const handleSavePlace = async (destId) => {
    if (!placeForm.name.trim()) { toast.error('Place name is required'); return }
    setSavingPlace(true)
    try {
      const payload = {
        name: placeForm.name.trim(),
        description: placeForm.description.trim(),
        imageUrl: placeForm.imageUrl.trim(),
        timeRequired: parseFloat(placeForm.timeRequired) || 2,
        entryCost: parseFloat(placeForm.entryCost) || 0,
        sortOrder: placeForm.sortOrder || 0,
        isActive: true,
      }
      if (editingPlace) {
        await updateAdminPlace(destId, editingPlace, payload)
        toast.success('Place updated')
      } else {
        await createAdminPlace(destId, payload)
        toast.success('Place added')
      }
      setEditingPlace(null)
      setPlaceForm({ name: '', description: '', imageUrl: '', timeRequired: '2', entryCost: '0', sortOrder: 0 })
      loadPlaces(destId)
    } catch (err) {
      toast.error(err.message || 'Failed to save place')
    } finally {
      setSavingPlace(false)
    }
  }

  const handleDeletePlace = async (destId, placeId, placeName) => {
    if (!window.confirm(`Delete "${placeName}"?`)) return
    try {
      await deleteAdminPlace(destId, placeId)
      toast.success('Place deleted')
      loadPlaces(destId)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  const load = () => {
    setLoading(true)
    getAdminDestinations()
      .then((res) => setDestinations(res.data))
      .catch(() => toast.error('Failed to load destinations'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm })
    setShowForm(true)
  }

  const openEdit = (dest) => {
    setEditing(dest.id)
    setForm({
      name: dest.name || '',
      description: dest.description || '',
      imageUrl: dest.imageUrl || '',
      estimatedCost: dest.estimatedCost?.toString() || '',
      travelTypes: [...(dest.travelTypes || [])],
      isActive: dest.isActive !== false,
      sortOrder: dest.sortOrder || 0,
      activeStartHour: dest.activeStartHour ?? 7,
      activeEndHour: dest.activeEndHour ?? 18,
    })
    setShowForm(true)
  }

  const toggleType = (type) => {
    setForm((prev) => ({
      ...prev,
      travelTypes: prev.travelTypes.includes(type)
        ? prev.travelTypes.filter((t) => t !== type)
        : [...prev.travelTypes, type],
    }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.estimatedCost || isNaN(form.estimatedCost) || Number(form.estimatedCost) < 0) {
      toast.error('Valid estimated cost is required'); return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        estimatedCost: parseFloat(form.estimatedCost),
        travelTypes: form.travelTypes,
        isActive: form.isActive,
        sortOrder: form.sortOrder,
        activeStartHour: form.activeStartHour ?? 7,
        activeEndHour: form.activeEndHour ?? 18,
      }
      if (editing) {
        await updateAdminDestination(editing, payload)
        toast.success('Destination updated')
      } else {
        await createAdminDestination(payload)
        toast.success('Destination created')
      }
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (dest) => {
    if (!window.confirm(`Delete "${dest.name}"?`)) return
    try {
      await deleteAdminDestination(dest.id)
      toast.success('Destination deleted')
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Destinations</h1>
          <p className="text-gray-400 mt-1">Manage places your agency offers to travelers</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Add Destination
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-32 bg-surface-border/30 rounded-lg mb-3" />
              <div className="h-5 bg-surface-border/30 rounded w-2/3 mb-2" />
              <div className="h-3 bg-surface-border/30 rounded w-full mb-1" />
              <div className="h-3 bg-surface-border/30 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : destinations.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-surface-border/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMapPin className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No destinations yet</h3>
          <p className="text-gray-500 text-sm mb-4">Add the places your agency offers trips to. Travelers will see and choose from these destinations.</p>
          <button onClick={openCreate} className="btn-primary">Add Your First Destination</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`card overflow-hidden ${!dest.isActive ? 'opacity-60' : ''}`}
            >
              <div className="h-32 bg-surface-lighter relative overflow-hidden">
                {dest.imageUrl ? (
                  <img src={dest.imageUrl} alt={dest.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('flex', 'items-center', 'justify-center'); const icon = document.createElement('div'); icon.className = 'text-gray-600'; icon.innerHTML = '<svg width=\"40\" height=\"40\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><path d=\"M21 15l-5-5L5 21\"/></svg>'; e.target.parentElement.appendChild(icon) }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiImage className="w-10 h-10 text-gray-600" />
                  </div>
                )}
                {!dest.isActive && (
                  <div className="absolute top-2 right-2 bg-amber-500/90 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FiEyeOff className="w-3 h-3" /> Hidden
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-white">{dest.name}</h3>
                  <span className="text-sm font-bold text-primary-400">₹{Number(dest.estimatedCost).toLocaleString()}</span>
                </div>
                {dest.description && (
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{dest.description}</p>
                )}
                {dest.travelTypes?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {dest.travelTypes.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2 border-t border-surface-border-light">
                  <button onClick={() => openEdit(dest)} className="btn-ghost text-xs flex items-center gap-1 text-gray-400 hover:text-primary-400">
                    <FiEdit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(dest)} className="btn-ghost text-xs flex items-center gap-1 text-gray-400 hover:text-red-400">
                    <FiTrash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                  <button onClick={() => toggleExpand(dest.id)} className={`btn-ghost text-xs flex items-center gap-1 transition-all ${
                    expandedDest === dest.id ? 'text-accent-400' : 'text-gray-400 hover:text-accent-400'
                  }`}>
                    <FiList className="w-3.5 h-3.5" /> Places
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-lighter">
                      {placesData[dest.id]?.length || dest.places?.length || 0}
                    </span>
                  </button>
                </div>
                <AnimatePresence>
                  {expandedDest === dest.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 border-t border-surface-border-light mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-medium text-gray-400">Attractions & Places</h4>
                          <button onClick={() => { openPlaceForm(null); setExpandedDest(dest.id) }} className="btn-ghost text-xs flex items-center gap-1 text-accent-400 hover:text-accent-300">
                            <FiPlus className="w-3 h-3" /> Add Place
                          </button>
                        </div>
                        {(placesData[dest.id] || []).length === 0 ? (
                          <p className="text-xs text-gray-500 text-center py-3">No places added yet. Add attractions that travelers can visit.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {(placesData[dest.id] || []).map((place) => (
                              <div key={place.id} className="flex items-center gap-2 bg-surface-lighter rounded-lg p-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-white truncate">{place.name}</p>
                                  <p className="text-[10px] text-gray-500"><FiClock className="w-3 h-3 inline mr-0.5" />{place.timeRequired}h · ₹{Number(place.entryCost).toLocaleString()}</p>
                                </div>
                                <button onClick={() => openPlaceForm(place)} className="btn-ghost p-1 text-gray-500 hover:text-primary-400">
                                  <FiEdit2 className="w-3 h-3" />
                                </button>
                                <button onClick={() => handleDeletePlace(dest.id, place.id, place.name)} className="btn-ghost p-1 text-gray-500 hover:text-red-400">
                                  <FiTrash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Inline place form */}
                        {showPlaceForm && (
                          <div className="mt-2 p-3 bg-surface-lighter rounded-lg space-y-2">
                            <input value={placeForm.name} onChange={(e) => setPlaceForm({...placeForm, name: e.target.value})} placeholder="Place name" className="input-field w-full text-xs py-1.5" />
                            <input value={placeForm.description} onChange={(e) => setPlaceForm({...placeForm, description: e.target.value})} placeholder="Short description" className="input-field w-full text-xs py-1.5" />
                            <input value={placeForm.imageUrl} onChange={(e) => setPlaceForm({...placeForm, imageUrl: e.target.value})} placeholder="Image URL" className="input-field w-full text-xs py-1.5" />
                            <div className="flex gap-2">
                              <input type="number" value={placeForm.timeRequired} onChange={(e) => setPlaceForm({...placeForm, timeRequired: e.target.value})} placeholder="Hours to explore" className="input-field w-1/2 text-xs py-1.5" />
                              <input type="number" value={placeForm.entryCost} onChange={(e) => setPlaceForm({...placeForm, entryCost: e.target.value})} placeholder="Entry cost ₹" className="input-field w-1/2 text-xs py-1.5" />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingPlace(null); setShowPlaceForm(false); setPlaceForm({ name: '', description: '', imageUrl: '', timeRequired: '2', entryCost: '0', sortOrder: 0 }) }} className="btn-ghost text-xs flex-1 py-1">Cancel</button>
                              <button onClick={() => handleSavePlace(dest.id)} disabled={savingPlace} className="btn-primary text-xs flex-1 py-1">{savingPlace ? 'Saving...' : editingPlace ? 'Update' : 'Add Place'}</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg card p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">{editing ? 'Edit Destination' : 'Add Destination'}</h2>
                <button onClick={() => setShowForm(false)} className="btn-ghost p-1"><FiX className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Manali, Goa, Jaipur"
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe this destination..."
                    rows={3}
                    className="input-field w-full resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                  <input
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="input-field w-full"
                  />
                  {form.imageUrl && (
                    <div className="mt-2 h-24 rounded-lg overflow-hidden bg-surface-lighter">
                      <img src={form.imageUrl} alt="preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('flex', 'items-center', 'justify-center'); const icon = document.createElement('div'); icon.className = 'text-gray-600'; icon.innerHTML = '<svg width=\"40\" height=\"40\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><path d=\"M21 15l-5-5L5 21\"/></svg>'; e.target.parentElement.appendChild(icon) }} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Estimated Cost (₹) *</label>
                  <input
                    type="number"
                    value={form.estimatedCost}
                    onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                    placeholder="25000"
                    min="0"
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Travel Types</label>
                  <p className="text-xs text-gray-500 mb-2">Select which trip types apply to this destination</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_TRAVEL_TYPES.map((type) => {
                      const selected = form.travelTypes.includes(type)
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleType(type)}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                            selected
                              ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                              : 'bg-surface-lighter border-surface-border-light text-gray-400 hover:border-primary-500/30'
                          }`}
                        >
                          {selected && <FiCheck className="w-3 h-3 inline mr-1" />}
                          {type}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Active Hours (Daily)</label>
                  <p className="text-xs text-gray-500 mb-2">Set the time window for activities each day. Meals/rest buffer (~2h) is auto-deducted.</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min="0" max="23"
                      value={form.activeStartHour}
                      onChange={(e) => setForm({ ...form, activeStartHour: parseInt(e.target.value) || 7 })}
                      className="input-field w-20 text-center"
                    />
                    <span className="text-gray-500">:00</span>
                    <span className="text-gray-400">to</span>
                    <input
                      type="number" min="0" max="23"
                      value={form.activeEndHour}
                      onChange={(e) => setForm({ ...form, activeEndHour: parseInt(e.target.value) || 18 })}
                      className="input-field w-20 text-center"
                    />
                    <span className="text-gray-500">:00</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-all flex items-center gap-1.5 ${
                      form.isActive
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-surface-lighter border-surface-border-light text-gray-400'
                    }`}
                  >
                    {form.isActive ? <FiEye className="w-3.5 h-3.5" /> : <FiEyeOff className="w-3.5 h-3.5" />}
                    {form.isActive ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>{editing ? 'Update' : 'Create'} Destination</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
