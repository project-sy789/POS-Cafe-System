import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import StockUpdateForm from './StockUpdateForm'
import { getProducts, getCategories } from '../../services/productService'
import toast from 'react-hot-toast'
import useSocket from '../../hooks/useSocket'

const InventoryManagement = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showStockForm, setShowStockForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [filterLowStock, setFilterLowStock] = useState(false)

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
      toast.error('Failed to load inventory data')
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

  const handleUpdateStock = (product) => {
    setSelectedProduct(product)
    setShowStockForm(true)
  }

  const handleFormClose = (success) => {
    setShowStockForm(false)
    setSelectedProduct(null)
    if (success) {
      fetchData()
    }
  }

  // Filter products
  let filteredProducts = products

  // Filter by category
  if (selectedCategory !== 'all') {
    filteredProducts = filteredProducts.filter(
      (p) => p.category?._id === selectedCategory
    )
  }

  // Filter by low stock
  if (filterLowStock) {
    filteredProducts = filteredProducts.filter(
      (p) => p.stockCount <= p.lowStockThreshold
    )
  }

  // Count low stock items
  const lowStockCount = products.filter(
    (p) => p.stockCount <= p.lowStockThreshold
  ).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading inventory...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold mb-2">จัดการคลังสินค้า</h2>
        <p className="text-gray-600">ติดตามและจัดการสต็อกสินค้า</p>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-orange-600 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="font-medium text-orange-900">
                    แจ้งเตือนสต็อกต่ำ
                  </p>
                  <p className="text-sm text-orange-700">
                    {lowStockCount} รายการมีสต็อกเหลือน้อย
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterLowStock(!filterLowStock)}
                className={filterLowStock ? 'bg-orange-100' : ''}
              >
                {filterLowStock ? 'แสดงทั้งหมด' : 'ดูสต็อกต่ำ'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            กรองตามหมวดหมู่
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Update Form Modal */}
      {showStockForm && selectedProduct && (
        <StockUpdateForm
          product={selectedProduct}
          onClose={handleFormClose}
        />
      )}

      {/* Inventory Table */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {filterLowStock
                ? 'ไม่พบสินค้าที่สต็อกต่ำ'
                : 'ไม่พบสินค้า'}
            </p>
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
                    สต็อกปัจจุบัน
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เกณฑ์สต็อกต่ำ
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
                {filteredProducts.map((product) => {
                  const isLowStock = product.stockCount <= product.lowStockThreshold
                  const isOutOfStock = product.stockCount === 0

                  return (
                    <tr
                      key={product._id}
                      className={`hover:bg-gray-50 ${
                        isLowStock ? 'bg-orange-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {(product.imageData || product.imageUrl) && (
                            <img
                              src={product.imageData || product.imageUrl}
                              alt={product.name}
                              className="w-12 h-12 rounded object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {product.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {product.category?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm font-medium ${
                            isOutOfStock
                              ? 'text-red-600'
                              : isLowStock
                              ? 'text-orange-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {product.stockCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {product.lowStockThreshold}
                      </td>
                      <td className="px-4 py-3">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStock(product)}
                        >
                          อัปเดตสต็อก
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryManagement
