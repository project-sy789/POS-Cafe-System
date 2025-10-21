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
import { createCategory, updateCategory } from '../../services/productService'
import toast from 'react-hot-toast'

const CategoryForm = ({ category, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    iconUrl: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [iconFile, setIconFile] = useState(null)
  const [iconPreview, setIconPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        imageUrl: category.imageUrl || '',
        iconUrl: category.iconUrl || '',
      })
      // Show imageData (base64) if available, otherwise imageUrl
      if (category.imageData) {
        setImagePreview(category.imageData)
      } else if (category.imageUrl) {
        setImagePreview(category.imageUrl)
      }
      if (category.iconUrl) {
        setIconPreview(category.iconUrl)
      }
    }
  }, [category])

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('กรุณาเลือกไฟล์รูปภาพ')
        return
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('ขนาดไฟล์ต้องไม่เกิน 2MB')
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleIconChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('กรุณาเลือกไฟล์รูปภาพ')
        return
      }

      // Validate file size (2MB max for icons)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('ขนาดไฟล์ต้องไม่เกิน 2MB')
        return
      }

      setIconFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setIconPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)

      if (imageFile) {
        submitData.append('image', imageFile)
      }

      if (iconFile) {
        submitData.append('icon', iconFile)
      }

      if (category) {
        // Update existing category
        await updateCategory(category._id, submitData)
        toast.success('อัปเดตหมวดหมู่เรียบร้อยแล้ว')
      } else {
        // Create new category
        await createCategory(submitData)
        toast.success('สร้างหมวดหมู่เรียบร้อยแล้ว')
      }
      onClose(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'ไม่สามารถบันทึกหมวดหมู่ได้')
      console.error('Error saving category:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? 'แก้ไขหมวดหมู่' : 'สร้างหมวดหมู่ใหม่'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              ชื่อหมวดหมู่ <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="เช่น กาแฟ, ชา, ขนมอบ"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              คำอธิบาย
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="คำอธิบายสั้นๆ เกี่ยวกับหมวดหมู่นี้"
              rows={3}
              disabled={loading}
              className="flex w-full rounded-md bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                border: `1px solid var(--theme-border)`,
                borderRadius: 'var(--theme-radius-sm)'
              }}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium mb-1">
              รูปภาพหมวดหมู่
            </label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              ขนาดแนะนำ: 400x400px | ไฟล์: PNG, JPG | ขนาดไม่เกิน 2MB
            </p>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Category Preview"
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>

          {/* Icon Upload */}
          <div>
            <label htmlFor="icon" className="block text-sm font-medium mb-1">
              ไอคอนหมวดหมู่
            </label>
            <Input
              id="icon"
              type="file"
              accept="image/*"
              onChange={handleIconChange}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              ขนาดแนะนำ: 64x64px | ไฟล์: PNG, SVG | ขนาดไม่เกิน 2MB | สำหรับแสดงใน category tabs
            </p>
            
            {/* Icon Preview */}
            {iconPreview && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={iconPreview}
                  alt="Icon Preview"
                  className="w-16 h-16 object-contain border rounded p-2 bg-gray-50"
                />
                <div className="text-sm text-gray-600">
                  <div className="font-medium">ตัวอย่าง Icon</div>
                  <div className="text-xs">จะแสดงใน category tabs</div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : category ? 'อัปเดต' : 'สร้าง'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CategoryForm
