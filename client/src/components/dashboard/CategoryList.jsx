import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import CategoryForm from './CategoryForm'
import { getCategories, deleteCategory } from '../../services/productService'
import toast from 'react-hot-toast'
import useSocket from '../../hooks/useSocket'

const CategoryList = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      toast.error('Failed to load categories')
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Listen for real-time category updates
  useSocket('category_update', (data) => {
    console.log('Category update received:', data)
    fetchCategories()
  })

  const handleCreate = () => {
    setEditingCategory(null)
    setShowForm(true)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDelete = async (categoryId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้?')) {
      return
    }

    try {
      await deleteCategory(categoryId)
      toast.success('ลบหมวดหมู่สำเร็จ')
      fetchCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'ไม่สามารถลบหมวดหมู่ได้')
      console.error('Error deleting category:', error)
    }
  }

  const handleFormClose = (success) => {
    setShowForm(false)
    setEditingCategory(null)
    if (success) {
      fetchCategories()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">หมวดหมู่สินค้า</h3>
          <p className="text-sm text-gray-600">จัดการหมวดหมู่สินค้า</p>
        </div>
        <Button onClick={handleCreate}>
          + เพิ่มหมวดหมู่
        </Button>
      </div>

      {/* Category Form Modal/Dialog */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={handleFormClose}
        />
      )}

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">ไม่พบหมวดหมู่</p>
            <Button onClick={handleCreate}>สร้างหมวดหมู่แรกของคุณ</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category._id} className="hover:shadow-md transition-shadow overflow-hidden">
              {/* Category Image - Show imageData (base64) first, then imageUrl, then icon */}
              {(category.imageData || category.imageUrl) ? (
                <div className="w-full h-48 overflow-hidden bg-gray-100">
                  <img
                    src={category.imageData || category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image load error for category:', category.name, category);
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-6xl">📁</span></div>';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-6xl">
                    {category.iconUrl ? (
                      <img src={category.iconUrl} alt={category.name} className="w-24 h-24 object-contain" />
                    ) : (
                      '📁'
                    )}
                  </span>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {category.iconUrl && (
                    <img src={category.iconUrl} alt="" className="w-6 h-6 object-contain" />
                  )}
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                  {category.description || 'No description'}
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(category)}
                    className="flex-1"
                  >
                    แก้ไข
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category._id)}
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    ลบ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryList
