import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { updateProduct } from '../../services/productService'
import toast from 'react-hot-toast'

const StockUpdateForm = ({ product, onClose }) => {
  const [stockCount, setStockCount] = useState(product.stockCount || 0)
  const [lowStockThreshold, setLowStockThreshold] = useState(
    product.lowStockThreshold || 10
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (stockCount < 0) {
      toast.error('จำนวนสต็อกต้องไม่ติดลบ')
      return
    }

    if (lowStockThreshold < 0) {
      toast.error('เกณฑ์สต็อกต่ำต้องไม่ติดลบ')
      return
    }

    try {
      setLoading(true)

      // Create FormData with updated stock information
      const formData = new FormData()
      formData.append('name', product.name)
      formData.append('price', product.price)
      formData.append('description', product.description || '')
      formData.append('category', product.category._id)
      formData.append('stockCount', stockCount)
      formData.append('lowStockThreshold', lowStockThreshold)
      formData.append('isAvailable', product.isAvailable)

      await updateProduct(product._id, formData)
      toast.success('อัปเดตสต็อกสำเร็จ')
      onClose(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'ไม่สามารถอัปเดตสต็อกได้')
      console.error('Error updating stock:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAdjust = (amount) => {
    setStockCount((prev) => Math.max(0, prev + amount))
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>อัปเดตสต็อก - {product.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            {(product.imageData || product.imageUrl) && (
              <img
                src={product.imageData || product.imageUrl}
                alt={product.name}
                className="w-16 h-16 rounded object-cover"
              />
            )}
            <div>
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-600">
                {product.category?.name || 'ไม่ระบุ'}
              </p>
              <p className="text-sm text-gray-600">
                ปัจจุบัน: {product.stockCount} หน่วย
              </p>
            </div>
          </div>

          {/* Stock Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              จำนวนสต็อก
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="0"
                value={stockCount}
                onChange={(e) => setStockCount(parseInt(e.target.value) || 0)}
                required
                className="flex-1"
              />
              <div className="flex space-x-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdjust(-10)}
                  disabled={stockCount < 10}
                >
                  -10
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdjust(-1)}
                  disabled={stockCount < 1}
                >
                  -1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdjust(1)}
                >
                  +1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdjust(10)}
                >
                  +10
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ใช้ปุ่มปรับเร็วหรือใส่ค่าโดยตรง
            </p>
          </div>

          {/* Low Stock Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เกณฑ์สต็อกต่ำ
            </label>
            <Input
              type="number"
              min="0"
              value={lowStockThreshold}
              onChange={(e) =>
                setLowStockThreshold(parseInt(e.target.value) || 0)
              }
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              แจ้งเตือนเมื่อสต็อกต่ำกว่าระดับนี้
            </p>
          </div>

          {/* Stock Status Preview */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              ตัวอย่างสถานะสต็อก
            </p>
            {stockCount === 0 ? (
              <div className="flex items-center text-red-600">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">สินค้าหมด</span>
              </div>
            ) : stockCount <= lowStockThreshold ? (
              <div className="flex items-center text-orange-600">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">แจ้งเตือนสต็อกต่ำ</span>
              </div>
            ) : (
              <div className="flex items-center text-green-600">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">มีสต็อก</span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'กำลังอัปเดต...' : 'อัปเดตสต็อก'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default StockUpdateForm
