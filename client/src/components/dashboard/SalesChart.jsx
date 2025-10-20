import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getOrders } from '../../services/orderService'

const SalesChart = () => {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('daily') // 'daily' or 'weekly'

  useEffect(() => {
    fetchSalesData()
  }, [viewMode])

  const fetchSalesData = async () => {
    try {
      setLoading(true)
      setError(null)

      const today = new Date()
      let startDate, endDate

      if (viewMode === 'daily') {
        // Last 7 days (including today)
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 6)
        startDate.setHours(0, 0, 0, 0)
        
        endDate = new Date()
        endDate.setHours(23, 59, 59, 999)
      } else {
        // Last 4 weeks (including this week)
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 27)
        startDate.setHours(0, 0, 0, 0)
        
        endDate = new Date()
        endDate.setHours(23, 59, 59, 999)
      }

      // Fetch all orders in the date range
      const orders = await getOrders({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })

      console.log('SalesChart - Total orders fetched:', orders.length)
      console.log('SalesChart - Completed orders:', orders.filter(o => o.status === 'Completed').length)
      console.log('SalesChart - Date range:', { startDate: startDate.toISOString(), endDate: endDate.toISOString() })

      // Process data based on view mode
      const processedData = viewMode === 'daily' 
        ? processDailyData(orders, startDate, endDate)
        : processWeeklyData(orders, startDate, endDate)

      console.log('SalesChart - Processed data:', processedData)

      setChartData(processedData)
    } catch (err) {
      console.error('Error fetching sales data:', err)
      setError('Failed to load sales data')
    } finally {
      setLoading(false)
    }
  }

  const processDailyData = (orders, startDate, endDate) => {
    const dailyData = {}
    
    // Initialize all days with 0 (use local date)
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      // Use local date string (YYYY-MM-DD)
      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      const day = String(currentDate.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`
      dailyData[dateKey] = { revenue: 0, orders: 0 }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Aggregate orders by day (only completed orders)
    orders.forEach(order => {
      if (order.status === 'Completed') {
        // Convert UTC to local date
        const orderDate = new Date(order.createdAt)
        const year = orderDate.getFullYear()
        const month = String(orderDate.getMonth() + 1).padStart(2, '0')
        const day = String(orderDate.getDate()).padStart(2, '0')
        const dateKey = `${year}-${month}-${day}`
        
        if (dailyData[dateKey]) {
          dailyData[dateKey].revenue += order.total
          dailyData[dateKey].orders += 1
        }
      }
    })

    // Convert to array format for chart
    return Object.keys(dailyData).sort().map(date => ({
      date: new Date(date + 'T00:00:00').toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
      revenue: Math.round(dailyData[date].revenue * 100) / 100,
      orders: dailyData[date].orders
    }))
  }

  const processWeeklyData = (orders, startDate, endDate) => {
    const weeklyData = {}
    
    // Initialize weeks
    const currentDate = new Date(startDate)
    let weekNumber = 1
    
    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate)
      const weekEnd = new Date(currentDate)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      
      const weekKey = `สัปดาห์ ${weekNumber}`
      weeklyData[weekKey] = { 
        revenue: 0, 
        orders: 0,
        startDate: new Date(weekStart),
        endDate: new Date(weekEnd)
      }
      
      currentDate.setDate(currentDate.getDate() + 7)
      weekNumber++
    }

    // Aggregate orders by week (only completed orders)
    orders.forEach(order => {
      if (order.status === 'Completed') {
        // Use local date for comparison
        const orderDate = new Date(order.createdAt)
        
        Object.keys(weeklyData).forEach(weekKey => {
          const week = weeklyData[weekKey]
          // Compare using local dates
          if (orderDate >= week.startDate && orderDate <= week.endDate) {
            week.revenue += order.total
            week.orders += 1
          }
        })
      }
    })

    // Convert to array format for chart
    return Object.keys(weeklyData).map(weekKey => ({
      date: weekKey,
      revenue: Math.round(weeklyData[weekKey].revenue * 100) / 100,
      orders: weeklyData[weekKey].orders
    }))
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(value)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchSalesData}
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle style={{ color: 'var(--theme-text-primary)' }}>แนวโน้มยอดขาย</CardTitle>
            <p className="text-sm mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
              {viewMode === 'daily' ? '7 วันที่ผ่านมา' : '4 สัปดาห์ที่ผ่านมา'}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('daily')}
              className="px-3 py-1 text-sm transition-colors"
              style={{
                backgroundColor: viewMode === 'daily' ? 'var(--theme-bg-accent)' : 'var(--theme-bg-secondary)',
                color: viewMode === 'daily' ? '#FFFFFF' : 'var(--theme-text-primary)',
                borderRadius: 'var(--theme-radius-sm)',
                border: `1px solid ${viewMode === 'daily' ? 'var(--theme-bg-accent)' : 'var(--theme-border)'}`
              }}
            >
              รายวัน
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className="px-3 py-1 text-sm transition-colors"
              style={{
                backgroundColor: viewMode === 'weekly' ? 'var(--theme-bg-accent)' : 'var(--theme-bg-secondary)',
                color: viewMode === 'weekly' ? '#FFFFFF' : 'var(--theme-text-primary)',
                borderRadius: 'var(--theme-radius-sm)',
                border: `1px solid ${viewMode === 'weekly' ? 'var(--theme-bg-accent)' : 'var(--theme-border)'}`
              }}
            >
              รายสัปดาห์
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 || chartData.every(d => d.revenue === 0 && d.orders === 0) ? (
          <div className="h-80 flex items-center justify-center" style={{ color: 'var(--theme-text-secondary)' }}>
            <div className="text-center">
              <p>ยังไม่มีข้อมูลการขาย</p>
              <p className="text-sm mt-1">เริ่มรับออเดอร์เพื่อดูแนวโน้ม</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--theme-text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--theme-text-secondary)"
                style={{ fontSize: '12px' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'รายได้') {
                    return [formatCurrency(value), 'รายได้']
                  }
                  return [value, 'ออเดอร์']
                }}
                contentStyle={{
                  backgroundColor: 'var(--theme-bg-primary)',
                  border: '1px solid var(--theme-border)',
                  borderRadius: 'var(--theme-radius-sm)',
                  padding: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#6B7280" 
                strokeWidth={2}
                dot={{ fill: '#6B7280', r: 4 }}
                activeDot={{ r: 6 }}
                name="รายได้"
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#9CA3AF" 
                strokeWidth={2}
                dot={{ fill: '#9CA3AF', r: 4 }}
                activeDot={{ r: 6 }}
                name="ออเดอร์"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default SalesChart
