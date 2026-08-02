import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSave, FiUpload, FiEye, FiImage, FiPhone, FiMapPin, FiNavigation } from 'react-icons/fi'
import toast from 'react-hot-toast'
import adminService from '../../services/adminService'

const PRESET_THEMES = [
  { name: 'Ocean', primary: '#3b82f6', accent: '#a855f7' },
  { name: 'Forest', primary: '#059669', accent: '#d97706' },
  { name: 'Sunset', primary: '#ea580c', accent: '#dc2626' },
  { name: 'Rose', primary: '#e11d48', accent: '#7c3aed' },
  { name: 'Midnight', primary: '#1e293b', accent: '#6366f1' },
  { name: 'Teal', primary: '#0d9488', accent: '#0891b2' },
]

const TEMPLATE_STYLES = [
  { id: 'modern', name: 'Modern', desc: 'Clean & minimal' },
  { id: 'classic', name: 'Classic', desc: 'Rich & elegant' },
  { id: 'vibrant', name: 'Vibrant', desc: 'Bold & colorful' },
  { id: 'nature', name: 'Nature', desc: 'Warm & organic' },
]

const TEMPLATE_BACKGROUNDS = [
  { label: 'None', value: '' },
  { label: 'Mountains', value: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80' },
  { label: 'Beach', value: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80' },
  { label: 'Desert', value: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80' },
  { label: 'Forest', value: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80' },
  { label: 'Temple', value: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=1920&q=80' },
  { label: 'Lake', value: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80' },
  { label: 'Custom URL', value: '__custom__' },
]

export default function BrandingSetup() {
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [existingLogoUrl, setExistingLogoUrl] = useState(null)
  const [primaryColor, setPrimaryColor] = useState('#3b82f6')
  const [accentColor, setAccentColor] = useState('#a855f7')
  const [tagline, setTagline] = useState('')
  const [backgroundImage, setBackgroundImage] = useState('')
  const [customBgUrl, setCustomBgUrl] = useState('')
  const [overlayOpacity, setOverlayOpacity] = useState(70)
  const [overlayBlur, setOverlayBlur] = useState('sm')
  const [templateStyle, setTemplateStyle] = useState('modern')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [locating, setLocating] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const data = await adminService.getBranding()
        if (data.logoUrl) { setLogoPreview(data.logoUrl); setExistingLogoUrl(data.logoUrl) }
        if (data.primaryColor) setPrimaryColor(data.primaryColor)
        if (data.accentColor) setAccentColor(data.accentColor)
        if (data.tagline) setTagline(data.tagline)
        if (data.backgroundImage) setBackgroundImage(data.backgroundImage)
        if (data.overlayOpacity != null) setOverlayOpacity(data.overlayOpacity)
        if (data.overlayBlur) setOverlayBlur(data.overlayBlur)
        if (data.templateStyle) setTemplateStyle(data.templateStyle)
        if (data.phone) setPhone(data.phone)
        if (data.address) setAddress(data.address)
        if (data.latitude != null) setLatitude(String(data.latitude))
        if (data.longitude != null) setLongitude(String(data.longitude))
      } catch (err) {
        console.warn('Could not fetch branding, using defaults:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBranding()
  }, [])

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6))
        setLongitude(pos.coords.longitude.toFixed(6))
        setLocating(false)
        toast.success('Location set to your current position')
      },
      () => {
        setLocating(false)
        toast.error('Could not get your location. Allow location access and try again.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const geocodeAddress = async () => {
    if (!address.trim()) {
      toast.error('Enter an address first so we can find its coordinates')
      return
    }
    setLocating(true)
    try {
      const query = `${address}, India`
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
      )
      const results = await res.json()
      if (!results || results.length === 0) {
        toast.error('Could not find that address. Try adding a city or landmark.')
        return
      }
      setLatitude(parseFloat(results[0].lat).toFixed(6))
      setLongitude(parseFloat(results[0].lon).toFixed(6))
      toast.success(`Found coordinates: ${results[0].display_name}`)
    } catch {
      toast.error('Geocoding service unavailable. Enter coordinates manually.')
    } finally {
      setLocating(false)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setLogoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleBackgroundSelect = (val) => {
    if (val === '__custom__') {
      const url = prompt('Enter background image URL:')
      if (url) { setBackgroundImage(url); setCustomBgUrl(url) }
    } else {
      setBackgroundImage(val)
      setCustomBgUrl('')
    }
  }

  const handleSave = async () => {
    setError('')
    setSaved(false)
    setSaving(true)
    try {
      const result = await adminService.updateBranding({
        logoFile,
        existingLogoUrl,
        backgroundImage: backgroundImage || null,
        overlayOpacity,
        overlayBlur,
        templateStyle,
        primaryColor,
        accentColor,
        tagline,
        phone,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      })
      if (result.logoUrl && result.logoUrl !== existingLogoUrl) {
        setLogoPreview(result.logoUrl)
        setExistingLogoUrl(result.logoUrl)
        setLogoFile(null)
      }
      window.dispatchEvent(new CustomEvent('branding-updated', { detail: result }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const bgStyle = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Branding Setup</h1>
          <p className="text-gray-400 mt-1">Customize your agency's look and feel</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowPreview(!showPreview)} className="btn-ghost">
            <FiEye className="w-4 h-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Live Preview'}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <FiSave className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Logo */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Logo</h2>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-surface-border flex items-center justify-center overflow-hidden bg-surface-secondary/50">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <FiUpload className="w-6 h-6 text-gray-500" />
                )}
              </div>
              <div>
                <label className="btn-ghost text-sm cursor-pointer">
                  {existingLogoUrl ? 'Change Logo' : 'Upload Logo'}
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
                <p className="text-xs text-gray-500 mt-1">Recommended: 200x200px PNG</p>
              </div>
            </div>
          </div>

          {/* Background Image */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Background Image</h2>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {TEMPLATE_BACKGROUNDS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => handleBackgroundSelect(t.value)}
                  className={`aspect-[3/2] rounded-lg border-2 overflow-hidden transition-all ${
                    backgroundImage === t.value
                      ? 'border-primary-500 ring-2 ring-primary-500/30'
                      : 'border-surface-border hover:border-gray-500'
                  } ${!t.value ? 'flex items-center justify-center bg-surface-secondary/50' : ''}`}
                >
                  {t.value && t.value !== '__custom__' ? (
                    <img src={t.value} alt={t.label} className="w-full h-full object-cover" />
                  ) : t.value === '__custom__' ? (
                    <FiImage className="w-5 h-5 text-gray-400" />
                  ) : (
                    <span className="text-xs text-gray-400">None</span>
                  )}
                </button>
              ))}
            </div>
            {customBgUrl && (
              <input
                type="text"
                value={customBgUrl}
                onChange={(e) => { setCustomBgUrl(e.target.value); setBackgroundImage(e.target.value) }}
                className="input-field w-full text-sm"
                placeholder="Paste image URL..."
              />
            )}
            {backgroundImage && (
              <div className="mt-2 h-20 rounded-lg overflow-hidden">
                <img src={backgroundImage} alt="Background preview" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Overlay Controls */}
            <div className="mt-6 pt-4 border-t border-surface-border">
              <h3 className="text-sm font-medium mb-3">Overlay Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">
                    Darkness: {overlayOpacity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Light</span>
                    <span>Dark</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Blur Amount</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'sm', label: 'Light' },
                      { id: 'md', label: 'Medium' },
                      { id: 'lg', label: 'Heavy' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setOverlayBlur(b.id)}
                        className={`flex-1 py-2 rounded-lg text-xs border transition-all ${
                          overlayBlur === b.id
                            ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                            : 'border-surface-border text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Template Style */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Template Style</h2>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATE_STYLES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplateStyle(t.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    templateStyle === t.id
                      ? 'border-primary-500 bg-primary-500/5'
                      : 'border-surface-border hover:border-gray-500'
                  }`}
                >
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Colors</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-surface-border bg-transparent"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="input-field flex-1 font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-surface-border bg-transparent"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="input-field flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Preset Themes</p>
              <div className="flex gap-2 flex-wrap">
                {PRESET_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => { setPrimaryColor(theme.primary); setAccentColor(theme.accent) }}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      primaryColor === theme.primary && accentColor === theme.accent
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-surface-border hover:border-gray-500'
                    }`}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Tagline</h2>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="input-field w-full"
              placeholder="Your agency's tagline..."
            />
          </div>

          {/* Location & Contact */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <FiMapPin className="w-4 h-4 text-primary-400" />
              Location & Contact
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Shown to travelers on your customer portal so they know where your agency is and how to reach you.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                <div className="flex items-center gap-2">
                  <FiPhone className="w-4 h-4 text-gray-500 shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field w-full"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Office Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field w-full resize-none"
                  rows={2}
                  placeholder="Shop 12, Mall Road, Manali, Himachal Pradesh"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Office Coordinates</label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Latitude</p>
                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="input-field w-full"
                      placeholder="e.g. 32.2396"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Longitude</p>
                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="input-field w-full"
                      placeholder="e.g. 77.1887"
                    />
                  </div>
                </div>
                <button
                  onClick={useMyLocation}
                  disabled={locating}
                  className="btn-ghost text-xs flex items-center gap-1.5"
                >
                  <FiNavigation className="w-3.5 h-3.5" />
                  {locating ? 'Getting location...' : 'Use my current location'}
                </button>
                <button
                  onClick={geocodeAddress}
                  disabled={locating}
                  className="btn-ghost text-xs flex items-center gap-1.5"
                >
                  <FiMapPin className="w-3.5 h-3.5" />
                  Find coordinates from address
                </button>
                {latitude && longitude && (
                  <p className="text-[10px] text-gray-500 mt-2">
                    {Number(latitude).toFixed(4)}°N, {Number(longitude).toFixed(4)}°E — travelers will see a map with this pin.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24 self-start"
          >
            <div className="card p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <FiEye className="w-4 h-4" />
                Live Preview
              </h2>
              <div className="rounded-xl min-h-[350px] relative overflow-hidden bg-surface">
                {backgroundImage && (
                  <>
                    <img src={backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})`,
                        backdropFilter: overlayBlur === 'none' ? 'none' : `blur(${{ sm: '4px', md: '12px', lg: '24px' }[overlayBlur] || '4px'})`,
                      }}
                    />
                  </>
                )}

                {/* Orbs */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[40%]" style={{ background: `radial-gradient(circle, ${primaryColor}15, transparent 70%)` }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[35%]" style={{ background: `radial-gradient(circle, ${accentColor}15, transparent 70%)` }} />

                <div className="relative z-10 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: logoPreview ? 'transparent' : primaryColor }}
                    >
                      {logoPreview ? (
                        <img src={logoPreview} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <span style={{ color: primaryColor }}>M</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: primaryColor }}>Agency Name</p>
                      {tagline && <p className="text-xs text-gray-400">{tagline}</p>}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    Plan Your Dream Trip
                  </h3>
                  <p className="text-sm text-gray-300">AI-powered itineraries for unforgettable adventures.</p>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: primaryColor }}>
                      Plan Your Trip
                    </button>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium" style={{ color: accentColor, border: `1px solid ${accentColor}` }}>
                      Explore
                    </button>
                  </div>

                  <div className="h-1.5 rounded-full" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})` }} />

                  {tagline && (
                    <div className="p-3 rounded-lg" style={{ backgroundColor: primaryColor + '15', border: `1px solid ${primaryColor}30` }}>
                      <p className="text-xs" style={{ color: primaryColor }}>"{tagline}"</p>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Template: {TEMPLATE_STYLES.find(t => t.id === templateStyle)?.name || 'Modern'}</span>
                    <span>Blur: {{ none: 'None', sm: 'Light', md: 'Medium', lg: 'Heavy' }[overlayBlur]}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
