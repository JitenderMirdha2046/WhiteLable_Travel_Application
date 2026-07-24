import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiSave, FiCamera, FiCheck, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import authService from '../services/authService'
import { updateProfile, uploadAvatar } from '../api/userApi'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  useEffect(() => {
    if (user?.avatarUrl) {
      setAvatarPreview(user.avatarUrl)
    }
  }, [user?.avatarUrl])

  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setAvatarPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    try {
      const res = await uploadAvatar(avatarFile)
      const newToken = res.data.token
      authService.setToken(newToken)
      const payload = JSON.parse(atob(newToken.split('.')[1]))
      updateUser({
        avatarUrl: payload.avatarUrl || null,
      })
      setAvatarFile(null)
      toast.success('Avatar updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar')
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address'
    if (form.password && form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (form.password && form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const res = await updateProfile({
        name: form.name,
        email: form.email,
        password: form.password || undefined,
      })
      const newToken = res.data.token
      authService.setToken(newToken)
      const payload = JSON.parse(atob(newToken.split('.')[1]))
      updateUser({
        name: payload.name,
        email: payload.email,
        avatarUrl: payload.avatarUrl || null,
      })
      setForm({ ...form, password: '', confirmPassword: '' })
      toast.success('Profile updated successfully!')
      if (avatarFile) {
        await handleAvatarUpload()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (key, value) => {
    setForm({ ...form, [key]: value })
    if (errors[key]) setErrors({ ...errors, [key]: '' })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
        <p className="text-gray-400">Manage your account settings and preferences.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiCamera className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <Input
                label="Name"
                icon={FiUser}
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                error={errors.name}
              />

              <Input
                label="Email"
                icon={FiMail}
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
              />

              <hr className="border-surface-border" />

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <Input
                    label="New Password"
                    icon={FiLock}
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    error={errors.password}
                  />
                  <Input
                    label="Confirm Password"
                    icon={FiLock}
                    type="password"
                    placeholder="Confirm new password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" loading={saving} icon={<FiSave />}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                {(form.password || form.name !== user?.name || form.email !== user?.email) && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setForm({
                      name: user?.name || '',
                      email: user?.email || '',
                      password: '',
                      confirmPassword: '',
                    })}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <p className="text-sm text-gray-400">Details about your account.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-surface-border">
                <span className="text-sm text-gray-400">Member Since</span>
                <span className="text-sm text-white">June 2026</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-surface-border">
                <span className="text-sm text-gray-400">Account Type</span>
                <span className="text-sm text-white">Free</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-400">Trips Planned</span>
                <span className="text-sm text-white">0</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
