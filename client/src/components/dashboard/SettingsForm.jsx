import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { getSettings, updateSettings } from '../../services/settingsService'
import themeStore from '../../store/themeStore'
import toast from 'react-hot-toast'

const SettingsForm = ({ activeSection = 'all' }) => {
  const [formData, setFormData] = useState({
    storeName: '',
    address: '',
    phone: '',
    taxRate: 7,
    taxIncludedInPrice: false,
    promptPayId: '',
    faviconUrl: '',
    logoUrl: '',
    uiTheme: 'default',
    featuredCategory: {
      mode: 'all',
      label: 'ทั้งหมด',
      icon: '🏪'
    }
  })
  const [faviconFile, setFaviconFile] = useState(null)
  const [faviconPreview, setFaviconPreview] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [featuredIconFile, setFeaturedIconFile] = useState(null)
  const [featuredIconPreview, setFeaturedIconPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setFetching(true)
      const data = await getSettings()
      setFormData({
        storeName: data.storeName || '',
        address: data.address || '',
        phone: data.phone || '',
        taxRate: data.taxRate || 7,
        taxIncludedInPrice: data.taxIncludedInPrice || false,
        promptPayId: data.promptPayId || '',
        faviconUrl: data.faviconUrl || '',
        logoUrl: data.logoUrl || '',
        uiTheme: data.uiTheme || 'default',
        featuredCategory: data.featuredCategory || {
          mode: 'all',
          label: 'ทั้งหมด',
          icon: '🏪'
        }
      })
      if (data.faviconData) {
        setFaviconPreview(data.faviconData)
      } else if (data.faviconUrl) {
        setFaviconPreview(data.faviconUrl)
      }
      if (data.logoData) {
        setLogoPreview(data.logoData)
      } else if (data.logoUrl) {
        setLogoPreview(data.logoUrl)
      }
      if (data.featuredCategory?.iconUrl) {
        setFeaturedIconPreview(data.featuredCategory.iconUrl)
      }
    } catch (error) {
      toast.error('ไม่สามารถโหลดการตั้งค่าได้')
      console.error('Error fetching settings:', error)
    } finally {
      setFetching(false)
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Store name is required'
    }

    if (!formData.taxRate && formData.taxRate !== 0) {
      newErrors.taxRate = 'Tax rate is required'
    } else if (formData.taxRate < 0 || formData.taxRate > 100) {
      newErrors.taxRate = 'Tax rate must be between 0 and 100'
    }

    if (!formData.promptPayId.trim()) {
      newErrors.promptPayId = 'PromptPay ID is required'
    } else if (!/^[0-9]{10,13}$/.test(formData.promptPayId)) {
      newErrors.promptPayId = 'PromptPay ID must be 10-13 digits (phone number or National ID/Tax ID)'
    }

    // Featured category validation
    if (formData.featuredCategory?.label && formData.featuredCategory.label.length > 20) {
      newErrors.featuredCategoryLabel = 'Featured category label cannot exceed 20 characters'
    }

    if (formData.featuredCategory?.mode && !['all', 'featured', 'hidden'].includes(formData.featuredCategory.mode)) {
      newErrors.featuredCategoryMode = 'Featured category mode must be "all", "featured", or "hidden"'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Handle nested featuredCategory fields
    if (name.startsWith('featuredCategory.')) {
      const field = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        featuredCategory: {
          ...prev.featuredCategory,
          [field]: value
        }
      }))
      // Clear error for this field
      if (errors[`featuredCategory${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
        setErrors((prev) => ({
          ...prev,
          [`featuredCategory${field.charAt(0).toUpperCase() + field.slice(1)}`]: '',
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'taxRate' ? parseFloat(value) || 0 : value,
      }))
      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: '',
        }))
      }
    }
  }

  const handleFaviconChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('กรุณาเลือกไฟล์รูปภาพ')
        return
      }

      // Validate file size (2MB max for favicon)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('ขนาดไฟล์ต้องไม่เกิน 2MB')
        return
      }

      setFaviconFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setFaviconPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFeaturedIconChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('กรุณาเลือกไฟล์รูปภาพ')
        return
      }

      // Validate file size (2MB max for icon)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('ขนาดไฟล์ต้องไม่เกิน 2MB')
        return
      }

      setFeaturedIconFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setFeaturedIconPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('กรุณาเลือกไฟล์รูปภาพ')
        return
      }

      // Validate file size (5MB max for logo)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB')
        return
      }

      setLogoFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleResetFeaturedCategory = () => {
    setFormData((prev) => ({
      ...prev,
      featuredCategory: {
        mode: 'all',
        label: 'ทั้งหมด',
        icon: '🏪'
      }
    }))
    // Clear any errors
    setErrors((prev) => ({
      ...prev,
      featuredCategoryLabel: '',
      featuredCategoryMode: ''
    }))
    toast.success('รีเซ็ตการตั้งค่าหมวดหมู่แนะนำเรียบร้อยแล้ว')
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
      submitData.append('storeName', formData.storeName)
      submitData.append('address', formData.address)
      submitData.append('phone', formData.phone)
      submitData.append('taxRate', formData.taxRate)
      submitData.append('taxIncludedInPrice', formData.taxIncludedInPrice)
      submitData.append('promptPayId', formData.promptPayId)
      submitData.append('uiTheme', formData.uiTheme)
      submitData.append('featuredCategory', JSON.stringify(formData.featuredCategory))

      if (faviconFile) {
        submitData.append('favicon', faviconFile)
      }

      if (logoFile) {
        submitData.append('logo', logoFile)
      }

      if (featuredIconFile) {
        submitData.append('featuredIcon', featuredIconFile)
      }

      const updatedSettings = await updateSettings(submitData)
      
      // Sync theme with theme store
      if (updatedSettings.uiTheme) {
        themeStore.getState().syncTheme(updatedSettings.uiTheme)
      }
      
      toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว')
      
      // Refresh settings to get updated URLs
      await fetchSettings()
    } catch (error) {
      toast.error(error.response?.data?.message || 'ไม่สามารถบันทึกการตั้งค่าได้')
      console.error('Error updating settings:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to check if section should be shown
  const shouldShowSection = (section) => {
    return activeSection === 'all' || activeSection === section
  }

  if (fetching) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">กำลังโหลดการตั้งค่า...</div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Store Information Section */}
        {shouldShowSection('store') && (
          <div className="space-y-6">

            {/* Store Name */}
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium mb-2">
                ชื่อร้าน <span className="text-red-500">*</span>
              </label>
              <Input
                id="storeName"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                placeholder="ระบุชื่อร้าน"
                disabled={loading}
              />
              {errors.storeName && (
                <p className="text-sm text-red-500 mt-1">{errors.storeName}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                จะแสดงบนใบเสร็จและรายงาน
              </p>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-2">
                ที่อยู่ร้าน
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="ระบุที่อยู่ร้าน"
                disabled={loading}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                ไม่บังคับ: ที่อยู่สำหรับใบเสร็จ
              </p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                เบอร์โทรศัพท์ร้าน
              </label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="เช่น 02-123-4567 หรือ 081-234-5678"
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                ไม่บังคับ: เบอร์โทรศัพท์สำหรับใบเสร็จและติดต่อลูกค้า
              </p>
            </div>
          </div>
        )}

        {/* Tax Section */}
        {shouldShowSection('tax') && (
          <div className="space-y-6">

            {/* Tax Rate */}
            <div>
              <label htmlFor="taxRate" className="block text-sm font-medium mb-2">
                อัตราภาษี (%) <span className="text-red-500">*</span>
              </label>
              <Input
                id="taxRate"
                name="taxRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={handleChange}
                placeholder="ระบุอัตราภาษี"
                disabled={loading}
              />
              {errors.taxRate && (
                <p className="text-sm text-red-500 mt-1">{errors.taxRate}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                อัตรา VAT มาตรฐานในประเทศไทยคือ 7%
              </p>
            </div>

            {/* Tax Included in Price */}
            <div>
              <label className="block text-sm font-medium mb-2">
                การคำนวณภาษี
              </label>
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="taxIncludedInPrice"
                    checked={!formData.taxIncludedInPrice}
                    onChange={() => setFormData(prev => ({ ...prev, taxIncludedInPrice: false }))}
                    disabled={loading}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">แยกภาษีจากราคาสินค้า</div>
                    <div className="text-xs text-gray-500">
                      ภาษีจะถูกเพิ่มเข้าไปในยอดรวม (ราคาสินค้า + ภาษี)
                      <br />
                      ตัวอย่าง: สินค้า 100 บาท + ภาษี 7% = ชำระ 107 บาท
                    </div>
                  </div>
                </label>
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="taxIncludedInPrice"
                    checked={formData.taxIncludedInPrice}
                    onChange={() => setFormData(prev => ({ ...prev, taxIncludedInPrice: true }))}
                    disabled={loading}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">รวมภาษีในราคาสินค้า</div>
                    <div className="text-xs text-gray-500">
                      ราคาสินค้ารวมภาษีแล้ว (ลูกค้าจ่ายตามราคาที่เห็น)
                      <br />
                      ตัวอย่าง: สินค้า 107 บาท (รวมภาษี 7 บาท) = ชำระ 107 บาท
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Payment Section */}
        {shouldShowSection('payment') && (
          <div className="space-y-6">

            {/* PromptPay ID */}
            <div>
              <label htmlFor="promptPayId" className="block text-sm font-medium mb-2">
                PromptPay ID <span className="text-red-500">*</span>
              </label>
              <Input
                id="promptPayId"
                name="promptPayId"
                value={formData.promptPayId}
                onChange={handleChange}
                placeholder="เบอร์โทรศัพท์หรือเลขบัตรประชาชน/เลขผู้เสียภาษี"
                disabled={loading}
              />
              {errors.promptPayId && (
                <p className="text-sm text-red-500 mt-1">{errors.promptPayId}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                10-13 หลัก: เบอร์โทรศัพท์ (10 หลัก) หรือเลขบัตรประชาชน/เลขผู้เสียภาษี (13 หลัก)
              </p>
            </div>
          </div>
        )}

        {/* Featured Category Section */}
        {shouldShowSection('featured') && (
          <div className="space-y-6">

            {/* Mode Selection */}
            <div>
              <label htmlFor="featuredCategoryMode" className="block text-sm font-medium mb-2">
                โหมดการแสดงผล
              </label>
              <select
                id="featuredCategoryMode"
                name="featuredCategory.mode"
                value={formData.featuredCategory?.mode || 'all'}
                onChange={handleChange}
                disabled={loading}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">แสดงสินค้าทั้งหมด (All Products)</option>
                <option value="featured">แสดงสินค้าขายดี (Best Sellers)</option>
                <option value="hidden">ซ่อนหมวดหมู่ (Hidden)</option>
              </select>
              {errors.featuredCategoryMode && (
                <p className="text-sm text-red-500 mt-1">{errors.featuredCategoryMode}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                เลือกว่าปุ่มจะแสดงสินค้าทั้งหมด, สินค้าขายดี หรือซ่อนปุ่มนี้
              </p>
            </div>

            {/* Label Input */}
            <div>
              <label htmlFor="featuredCategoryLabel" className="block text-sm font-medium mb-2">
                ข้อความบนปุ่ม
              </label>
              <Input
                id="featuredCategoryLabel"
                name="featuredCategory.label"
                value={formData.featuredCategory?.label || ''}
                onChange={handleChange}
                maxLength={20}
                placeholder="เช่น ทั้งหมด, ขายดี, แนะนำ"
                disabled={loading}
              />
              {errors.featuredCategoryLabel && (
                <p className="text-sm text-red-500 mt-1">{errors.featuredCategoryLabel}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                ความยาวสูงสุด 20 ตัวอักษร ({formData.featuredCategory?.label?.length || 0}/20)
              </p>
            </div>

            {/* Icon Upload */}
            <div>
              <label htmlFor="featuredIcon" className="block text-sm font-medium mb-2">
                ไอคอนบนปุ่ม (รูปภาพ)
              </label>
              <Input
                id="featuredIcon"
                type="file"
                accept="image/*"
                onChange={handleFeaturedIconChange}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                ขนาดแนะนำ: 64x64px | ไฟล์: PNG, SVG | ขนาดไม่เกิน 2MB | สำหรับแสดงใน category tabs
              </p>
              
              {/* Icon Preview */}
              {featuredIconPreview && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={featuredIconPreview}
                    alt="Featured Icon Preview"
                    className="w-16 h-16 object-contain border rounded p-2 bg-gray-50"
                  />
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">ตัวอย่างไอคอน</div>
                    <div className="text-xs">จะแสดงบนปุ่มหมวดหมู่</div>
                  </div>
                </div>
              )}
            </div>

            {/* Text Icon Input (Alternative) */}
            <div>
              <label htmlFor="featuredCategoryIcon" className="block text-sm font-medium mb-2">
                หรือใช้อีโมจิ/ข้อความ (ถ้าไม่อัปโหลดรูป)
              </label>
              <Input
                id="featuredCategoryIcon"
                name="featuredCategory.icon"
                value={formData.featuredCategory?.icon || ''}
                onChange={handleChange}
                maxLength={5}
                placeholder="เช่น 🏪, ⭐, 🔥"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                ใช้อีโมจิหรือข้อความสั้นๆ (ถ้าไม่มีรูปภาพ)
              </p>
            </div>

            {/* Preview Section */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium mb-3">ตัวอย่างปุ่ม:</p>
              <button
                type="button"
                className="px-6 py-4 bg-blue-600 text-white rounded-lg font-medium shadow-lg hover:bg-blue-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {featuredIconPreview ? (
                    <img
                      src={featuredIconPreview}
                      alt="Icon"
                      className="w-6 h-6 md:w-8 md:h-8 object-contain"
                    />
                  ) : (
                    <span className="text-lg">
                      {formData.featuredCategory?.icon || '🏪'}
                    </span>
                  )}
                  <span>
                    {formData.featuredCategory?.label || 'ทั้งหมด'}
                  </span>
                </div>
              </button>
              <p className="text-xs text-gray-500 mt-2">
                ปุ่มนี้จะแสดงเป็นปุ่มแรกในหน้า POS
              </p>
            </div>

            {/* Reset Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetFeaturedCategory}
                disabled={loading}
              >
                รีเซ็ตเป็นค่าเริ่มต้น
              </Button>
            </div>
          </div>
        )}

        {/* UI Theme Section */}
        {shouldShowSection('theme') && (
          <div className="space-y-6">

            {/* Theme Selection */}
            <div>
              <label htmlFor="uiTheme" className="block text-sm font-medium mb-2">
                เลือกธีม
              </label>
              <select
                id="uiTheme"
                name="uiTheme"
                value={formData.uiTheme}
                onChange={handleChange}
                disabled={loading}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="default">ธีมปกติ (Default)</option>
                <option value="minimal">ธีมมินิมอล (Minimal)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                ธีมมินิมอลจะทำให้ UI ดูเรียบง่าย สะอาดตา และใช้งานง่ายขึ้น
              </p>
            </div>

            {/* Theme Preview */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium mb-3">คำอธิบายธีม:</p>
              {formData.uiTheme === 'default' ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong>ธีมปกติ:</strong> ใช้สีสันหลากหลาย มีเงาและเอฟเฟกต์ เหมาะสำหรับการใช้งานทั่วไป
                  </p>
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-1 ml-2">
                    <li>สีสันสดใส (น้ำเงิน, เขียว, ฯลฯ)</li>
                    <li>มีเงาและ gradient</li>
                    <li>Border radius ใหญ่</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong>ธีมมินิมอล:</strong> เน้นความเรียบง่าย ใช้สีน้อย ลดเงาและเอฟเฟกต์
                  </p>
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-1 ml-2">
                    <li>สีพื้นฐาน (ขาว, เทา, ดำ)</li>
                    <li>ไม่มีเงาหรือมีน้อยมาก</li>
                    <li>Border บาง, radius เล็ก</li>
                    <li>เน้นข้อมูลสำคัญให้เด่นชัด</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Branding Section */}
        {shouldShowSection('branding') && (
          <div className="space-y-6">

            {/* Favicon Upload */}
            <div>
              <label htmlFor="favicon" className="block text-sm font-medium mb-2">
                Favicon (ไอคอนเว็บไซต์)
              </label>
              <Input
                id="favicon"
                type="file"
                accept="image/*"
                onChange={handleFaviconChange}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                ขนาดแนะนำ: 32x32px หรือ 64x64px | ไฟล์: PNG, ICO, SVG | ขนาดไม่เกิน 2MB
              </p>
              
              {/* Favicon Preview */}
              {faviconPreview && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={faviconPreview}
                    alt="Favicon Preview"
                    className="w-16 h-16 object-contain border rounded p-2 bg-gray-50"
                  />
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">ตัวอย่าง Favicon</div>
                    <div className="text-xs">จะแสดงบน browser tab</div>
                  </div>
                </div>
              )}
            </div>

            {/* Logo Upload */}
            <div>
              <label htmlFor="logo" className="block text-sm font-medium mb-2">
                โลโก้ร้าน
              </label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                ขนาดแนะนำ: 200x200px หรือ 400x400px | ไฟล์: PNG, JPG | ขนาดไม่เกิน 5MB
              </p>
              
              {/* Logo Preview */}
              {logoPreview && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-32 h-32 object-contain border rounded p-2 bg-gray-50"
                  />
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">ตัวอย่างโลโก้</div>
                    <div className="text-xs">จะแสดงบนใบเสร็จและรายงาน</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button - Always show at bottom */}
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={loading}>
            {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default SettingsForm
