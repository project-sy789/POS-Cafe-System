import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { getSalesReport } from '../../services/orderService'

const MetricsCards = () => {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    orderCount: 0,
    averageOrderValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTodayMetrics()
  }, [])

  const fetchTodayMetrics = async () => {
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
      
      setMetrics({
        totalRevenue: report.totalRevenue || 0,
        orderCount: report.orderCount || 0,
        averageOrderValue: report.averageOrderValue || 0
      })
    } catch (err) {
      console.error('Error fetching metrics:', err)
      setError('Failed to load metrics')
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchTodayMetrics}
          className="mt-2 text-sm text-red-700 underline hover:text-red-800"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {/* Total Revenue Card */}
      <Card style={{
        backgroundColor: 'var(--theme-bg-primary)',
        borderColor: 'var(--theme-border)',
        boxShadow: 'var(--theme-shadow-sm)'
      }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs md:text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
            รายได้วันนี้
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary)' }}>ยอดขายรวมวันนี้</p>
        </CardContent>
      </Card>

      {/* Order Count Card */}
      <Card style={{
        backgroundColor: 'var(--theme-bg-primary)',
        borderColor: 'var(--theme-border)',
        boxShadow: 'var(--theme-shadow-sm)'
      }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs md:text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
            จำนวนออเดอร์
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>
            {metrics.orderCount}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary)' }}>ออเดอร์ที่เสร็จสมบูรณ์วันนี้</p>
        </CardContent>
      </Card>

      {/* Average Order Value Card */}
      <Card style={{
        backgroundColor: 'var(--theme-bg-primary)',
        borderColor: 'var(--theme-border)',
        boxShadow: 'var(--theme-shadow-sm)'
      }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs md:text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
            มูลค่าเฉลี่ยต่อออเดอร์
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>
            {formatCurrency(metrics.averageOrderValue)}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary)' }}>ค่าเฉลี่ยต่อออเดอร์</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default MetricsCards
