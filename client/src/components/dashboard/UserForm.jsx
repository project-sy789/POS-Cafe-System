import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { createUser, updateUser } from '../../services/userService'
import toast from 'react-hot-toast'

const UserForm = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Cashier',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        password: '', // Don't populate password for security
        role: user.role || 'Cashier',
      })
    }
  }, [user])

  const validate = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    // Password is required for new users, optional for updates
    if (!user && !formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.role) {
      newErrors.role = 'Role is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)

    try {
      const submitData = {
        username: formData.username,
        role: formData.role,
      }

      // Only include password if it's provided
      if (formData.password) {
        submitData.password = formData.password
      }

      if (user) {
        // Update existing user
        await updateUser(user._id, submitData)
        toast.success('User updated successfully')
      } else {
        // Create new user
        await createUser(submitData)
        toast.success('User created successfully')
      }
      onClose(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user')
      console.error('Error saving user:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Edit User' : 'Create New User'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              disabled={loading}
              autoComplete="off"
            />
            {errors.username && (
              <p className="text-sm text-red-500 mt-1">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password {!user && <span className="text-red-500">*</span>}
              {user && <span className="text-gray-500 text-xs ml-1">(leave blank to keep current)</span>}
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={user ? 'Enter new password (optional)' : 'Enter password'}
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
            {!errors.password && (
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Cashier">Cashier (พนักงาน)</option>
              <option value="Manager">Manager (ผู้จัดการ)</option>
            </select>
            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.role === 'Cashier' && 'สามารถเข้าถึงหน้า POS และ Barista, สร้างออเดอร์'}
              {formData.role === 'Manager' && 'เข้าถึงได้ทุกฟีเจอร์ รวมถึงแดชบอร์ดและการตั้งค่า'}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : user ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UserForm
