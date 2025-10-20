import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import ProductForm from './ProductForm'
import { getProducts, getCategories, deleteProduct } from '../../services/productService'
import toast from 'react-hot-toast'
import useSocket from '../../hooks/useSocket'

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Fetch products and categories
  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      toast.error('Failed to load data')
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Listen for real-time product updates
  useSocket('product_update', (data) => {
    console.log('Product update received:', data)
    fetchData()
  })

  // Listen for category updates (in case categories change)
  useSocket('category_update', (data) => {
    console.log('Category update received:', data)
    fetchData()
  })

  const handleCreate = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')) {
      return
    }

    try {
      await deleteProduct(productId)
      toast.success('ลบสินค้าสำเร็จ')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'ไม่สามารถลบสินค้าได้')
      console.error('Error deleting product:', error)
    }
  }

  const handleFormClose = (success) => {
    setShowForm(false)
    setEditingProduct(null)
    if (success) {
      fetchData()
    }
  }

  // Filter products by category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category?._id === selectedCategory)

  // Get category name helper
  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c._id === categoryId)
    return category ? category.name : 'Unknown'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">กำลังโหลดสินค้า...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
        <div>
          <h3 className="text-base md:text-lg font-semibold">สินค้า</h3>
          <p className="text-xs md:text-sm text-gray-600">จัดการรายการเมนู</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm md:text-base min-h-[44px] touch-manipulation"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <Button onClick={handleCreate} className="min-h-[44px] touch-manipulation">
            + เพิ่มสินค้า
          </Button>
        </div>
      </div>

      {/* Product Form Modal/Dialog */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onClose={handleFormClose}
        />
      )}

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              {selectedCategory === 'all'
                ? 'ไม่พบสินค้า'
                : 'ไม่มีสินค้าในหมวดหมู่นี้'}
            </p>
            <Button onClick={handleCreate}>สร้างสินค้าแรกของคุณ</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สินค้า
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    หมวดหมู่
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ราคา
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สต็อก
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {product.category?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      ฿{product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`
                          ${product.stockCount <= product.lowStockThreshold
                            ? 'text-red-600 font-medium'
                            : 'text-gray-900'
                          }
                        `}
                      >
                        {product.stockCount}
                        {product.stockCount <= product.lowStockThreshold && ' (Low)'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`
                          inline-flex px-2 py-1 text-xs font-semibold rounded-full
                          ${product.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }
                        `}
                      >
                        {product.isAvailable ? 'พร้อมขาย' : 'ไม่พร้อมขาย'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="min-h-[40px] touch-manipulation"
                        >
                          แก้ไข
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[40px] touch-manipulation"
                        >
                          ลบ
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductList
