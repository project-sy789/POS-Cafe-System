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
import { createProduct, updateProduct } from '../../services/productService'
import toast from 'react-hot-toast'

const ProductForm = ({ product, categories, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stockCount: '',
    lowStockThreshold: '10',
    isAvailable: true,
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [options, setOptions] = useState([])
  const [optionIconFiles, setOptionIconFiles] = useState({})

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        category: product.category?._id || '',
        stockCount: product.stockCount || '',
        lowStockThreshold: product.lowStockThreshold || '10',
        isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
      })
      if (product.imageUrl) {
        setImagePreview(product.imageUrl)
      }
      if (product.options && product.options.length > 0) {
        setOptions(product.options)
      }
    }
  }, [product])

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (formData.stockCount === '' || parseInt(formData.stockCount) < 0) {
      newErrors.stockCount = 'Valid stock count is required'
    }

    // Validate options structure
    if (options.length > 0) {
      for (let i = 0; i < options.length; i++) {
        const optionGroup = options[i]
        
        if (!optionGroup.groupName.trim()) {
          newErrors.options = `Option group ${i + 1} must have a name`
          break
        }

        if (optionGroup.values.length === 0) {
          newErrors.options = `Option group "${optionGroup.groupName}" must have at least one value`
          break
        }

        for (let j = 0; j < optionGroup.values.length; j++) {
          const value = optionGroup.values[j]
          if (!value.name.trim()) {
            newErrors.options = `Option group "${optionGroup.groupName}" has a value without a name`
            break
          }
        }

        if (newErrors.options) break
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
        toast.error('Please select an image file')
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
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

  const addOptionGroup = () => {
    setOptions([
      ...options,
      {
        groupName: '',
        type: 'single',
        required: false,
        values: [{ name: '', priceModifier: 0 }],
      },
    ])
  }

  const removeOptionGroup = (groupIndex) => {
    setOptions(options.filter((_, index) => index !== groupIndex))
  }

  const updateOptionGroup = (groupIndex, field, value) => {
    const updatedOptions = [...options]
    updatedOptions[groupIndex][field] = value
    setOptions(updatedOptions)
  }

  const addOptionValue = (groupIndex) => {
    const updatedOptions = [...options]
    updatedOptions[groupIndex].values.push({ name: '', priceModifier: 0, iconUrl: '' })
    setOptions(updatedOptions)
  }

  const removeOptionValue = (groupIndex, valueIndex) => {
    const updatedOptions = [...options]
    updatedOptions[groupIndex].values = updatedOptions[groupIndex].values.filter(
      (_, index) => index !== valueIndex
    )
    setOptions(updatedOptions)
  }

  const updateOptionValue = (groupIndex, valueIndex, field, value) => {
    const updatedOptions = [...options]
    if (field === 'priceModifier') {
      // Validate numeric input
      const numValue = parseFloat(value)
      updatedOptions[groupIndex].values[valueIndex][field] = isNaN(numValue) ? 0 : numValue
    } else {
      updatedOptions[groupIndex].values[valueIndex][field] = value
    }
    setOptions(updatedOptions)
  }

  const handleOptionIconChange = (groupIndex, valueIndex, file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      // Validate file size (2MB max for icons)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Icon size must be less than 2MB')
        return
      }

      // Store file for upload
      const key = `${groupIndex}-${valueIndex}`
      setOptionIconFiles(prev => ({
        ...prev,
        [key]: file
      }))

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const updatedOptions = [...options]
        updatedOptions[groupIndex].values[valueIndex].iconUrl = reader.result
        setOptions(updatedOptions)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeOptionIcon = (groupIndex, valueIndex) => {
    const key = `${groupIndex}-${valueIndex}`
    setOptionIconFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[key]
      return newFiles
    })

    const updatedOptions = [...options]
    updatedOptions[groupIndex].values[valueIndex].iconUrl = ''
    setOptions(updatedOptions)
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
      submitData.append('price', formData.price)
      submitData.append('description', formData.description)
      submitData.append('category', formData.category)
      submitData.append('stockCount', formData.stockCount)
      submitData.append('lowStockThreshold', formData.lowStockThreshold)
      submitData.append('isAvailable', formData.isAvailable)

      // Include options data if present
      if (options.length > 0) {
        // Create a copy of options without the preview URLs for icon files
        const optionsForSubmit = options.map(group => ({
          ...group,
          values: group.values.map(value => {
            // Keep iconUrl only if it's an existing server URL (starts with /uploads/)
            // Remove data URLs (preview URLs from FileReader)
            const iconUrl = value.iconUrl && value.iconUrl.startsWith('/uploads/') 
              ? value.iconUrl 
              : '';
            return {
              ...value,
              iconUrl
            };
          })
        }));
        submitData.append('options', JSON.stringify(optionsForSubmit))
      }

      if (imageFile) {
        submitData.append('image', imageFile)
      }

      // Append option icon files
      Object.entries(optionIconFiles).forEach(([key, file]) => {
        submitData.append('optionIcons', file);
      });

      if (product) {
        // Update existing product
        await updateProduct(product._id, submitData)
        toast.success('Product updated successfully')
      } else {
        // Create new product
        await createProduct(submitData)
        toast.success('Product created successfully')
      }
      onClose(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product')
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Create New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Cappuccino, Croissant"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Price and Category Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                Price (฿) <span className="text-red-500">*</span>
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                disabled={loading}
              />
              {errors.price && (
                <p className="text-sm text-red-500 mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
                className="flex h-10 w-full rounded-md bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  border: `1px solid var(--theme-border)`,
                  borderRadius: 'var(--theme-radius-sm)'
                }}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-500 mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the product"
              rows={3}
              disabled={loading}
              className="flex w-full rounded-md bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                border: `1px solid var(--theme-border)`,
                borderRadius: 'var(--theme-radius-sm)'
              }}
            />
          </div>

          {/* Stock Count and Threshold Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="stockCount" className="block text-sm font-medium mb-1">
                Stock Count <span className="text-red-500">*</span>
              </label>
              <Input
                id="stockCount"
                name="stockCount"
                type="number"
                min="0"
                value={formData.stockCount}
                onChange={handleChange}
                placeholder="0"
                disabled={loading}
              />
              {errors.stockCount && (
                <p className="text-sm text-red-500 mt-1">{errors.stockCount}</p>
              )}
            </div>

            <div>
              <label htmlFor="lowStockThreshold" className="block text-sm font-medium mb-1">
                Low Stock Threshold
              </label>
              <Input
                id="lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                placeholder="10"
                disabled={loading}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium mb-1">
              Product Image
            </label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Max file size: 5MB. Supported formats: JPG, PNG, WebP
            </p>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>

          {/* Product Options Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">
                Product Options
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOptionGroup}
                disabled={loading}
              >
                + Add Option Group
              </Button>
            </div>
            
            {/* Display list of existing option groups */}
            {options.length > 0 && (
              <div className="space-y-4">
                {options.map((optionGroup, groupIndex) => (
                  <div
                    key={groupIndex}
                    className="p-4"
                    style={{
                      border: `1px solid var(--theme-border)`,
                      borderRadius: 'var(--theme-radius-sm)',
                      backgroundColor: 'var(--theme-bg-secondary)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium">
                        Option Group {groupIndex + 1}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOptionGroup(groupIndex)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>

                    {/* Group Name */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">
                        Group Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={optionGroup.groupName}
                        onChange={(e) =>
                          updateOptionGroup(groupIndex, 'groupName', e.target.value)
                        }
                        placeholder="e.g., ขนาด, ความหวาน, ประเภทนม"
                        disabled={loading}
                      />
                    </div>

                    {/* Type and Required Row */}
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Selection Type
                        </label>
                        <select
                          value={optionGroup.type}
                          onChange={(e) =>
                            updateOptionGroup(groupIndex, 'type', e.target.value)
                          }
                          disabled={loading}
                          className="flex h-10 w-full rounded-md bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{
                            border: `1px solid var(--theme-border)`,
                            borderRadius: 'var(--theme-radius-sm)'
                          }}
                        >
                          <option value="single">Single Select</option>
                          <option value="multiple">Multiple Select</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={optionGroup.required}
                          onChange={(e) =>
                            updateOptionGroup(groupIndex, 'required', e.target.checked)
                          }
                          disabled={loading}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="ml-2 text-sm font-medium">
                          Required
                        </label>
                      </div>
                    </div>

                    {/* Option Values */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">
                          Option Values
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOptionValue(groupIndex)}
                          disabled={loading}
                        >
                          + Add Value
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {optionGroup.values.map((value, valueIndex) => (
                          <div
                            key={valueIndex}
                            className="p-3 rounded"
                            style={{
                              backgroundColor: 'var(--theme-bg-primary)',
                              border: `1px solid var(--theme-border)`,
                              borderRadius: 'var(--theme-radius-sm)'
                            }}
                          >
                            <div className="flex items-start gap-2 mb-2">
                              {/* Icon Preview */}
                              {value.iconUrl && (
                                <div className="relative">
                                  <img
                                    src={value.iconUrl}
                                    alt={value.name}
                                    className="w-12 h-12 object-cover rounded border"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeOptionIcon(groupIndex, valueIndex)}
                                    disabled={loading}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                              
                              <div className="flex-1 space-y-2">
                                {/* Value Name */}
                                <Input
                                  value={value.name}
                                  onChange={(e) =>
                                    updateOptionValue(
                                      groupIndex,
                                      valueIndex,
                                      'name',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Value name (e.g., เล็ก, กลาง, ใหญ่)"
                                  disabled={loading}
                                />
                                
                                {/* Price Modifier and Icon Upload Row */}
                                <div className="flex items-center gap-2">
                                  <div className="w-32">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={value.priceModifier}
                                      onChange={(e) =>
                                        updateOptionValue(
                                          groupIndex,
                                          valueIndex,
                                          'priceModifier',
                                          e.target.value
                                        )
                                      }
                                      placeholder="฿0"
                                      disabled={loading}
                                    />
                                  </div>
                                  
                                  {/* Icon Upload Button */}
                                  <label className="cursor-pointer">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleOptionIconChange(
                                          groupIndex,
                                          valueIndex,
                                          e.target.files[0]
                                        )
                                      }
                                      disabled={loading}
                                      className="hidden"
                                    />
                                    <div className="px-3 py-2 text-sm border rounded hover:bg-gray-50 transition-colors">
                                      {value.iconUrl ? '🖼️ Change Icon' : '📷 Add Icon'}
                                    </div>
                                  </label>
                                </div>
                              </div>
                              
                              {/* Remove Value Button */}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOptionValue(groupIndex, valueIndex)}
                                disabled={loading || optionGroup.values.length === 1}
                                className="text-red-600 hover:text-red-700 mt-1"
                              >
                                ×
                              </Button>
                            </div>
                            
                            {value.iconUrl && (
                              <p className="text-xs text-gray-500 mt-1">
                                Icon will be displayed in the customization modal
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {options.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                No options added. Click "Add Option Group" to create customizable options for this product.
              </p>
            )}
            
            {errors.options && (
              <p className="text-sm text-red-500 mt-2">{errors.options}</p>
            )}
          </div>

          {/* Availability Checkbox */}
          <div className="flex items-center">
            <input
              id="isAvailable"
              name="isAvailable"
              type="checkbox"
              checked={formData.isAvailable}
              onChange={handleChange}
              disabled={loading}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isAvailable" className="ml-2 text-sm font-medium">
              Product is available for sale
            </label>
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
              {loading ? 'Saving...' : product ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ProductForm
