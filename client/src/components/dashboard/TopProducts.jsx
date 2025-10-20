import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { getSalesReport } from '../../services/orderService'

const TopProducts = () => {
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTopProducts()
  }, [])

  const fetchTopProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get today's date range
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const startDate = today.toISOString()
      
      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)
      const endDate = endOfDay.toISOString()

      // Fetch sales report for today
      const report = await getSalesReport({ startDate, endDate })
      
      setTopProducts(report.topProducts || [])
    } catch (err) {
      console.error('Error fetching top products:', err)
      setError('Failed to load top products')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchTopProducts}
              className="mt-2 text-sm text-red-700 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card style={{
      backgroundColor: 'var(--theme-bg-primary)',
      borderColor: 'var(--theme-border)',
      boxShadow: 'var(--theme-shadow-sm)'
    }}>
      <CardHeader>
        <CardTitle style={{ color: 'var(--theme-text-primary)' }}>สินค้าขายดี</CardTitle>
        <p className="text-sm mt-1" style={{ color: 'var(--theme-text-secondary)' }}>สินค้าที่ขายดีที่สุดวันนี้</p>
      </CardHeader>
      <CardContent>
        {topProducts.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--theme-text-secondary)' }}>
            <p>ยังไม่มีข้อมูลการขาย</p>
            <p className="text-sm mt-1">เริ่มรับออเดอร์เพื่อดูสินค้าขายดี</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 transition-colors"
                style={{
                  backgroundColor: 'var(--theme-bg-secondary)',
                  borderRadius: 'var(--theme-radius-sm)',
                  border: `1px solid var(--theme-border)`
                }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold"
                    style={{
                      backgroundColor: 'var(--theme-bg-accent)',
                      color: '#FFFFFF'
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>{product.productName}</p>
                    <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                      ขายได้ {product.totalQuantity} {product.totalQuantity === 1 ? 'ชิ้น' : 'ชิ้น'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                    {formatCurrency(product.totalRevenue)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>รายได้</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TopProducts
