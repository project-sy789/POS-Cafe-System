import React, { useState, useEffect } from 'react'
import { getOrders } from '../services/orderService'
import FilterBar from '../components/dashboard/FilterBar'
import OrderTable from '../components/dashboard/OrderTable'
import ExportButton from '../components/dashboard/ExportButton'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

const SalesReportsPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paymentMethod: '',
    status: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 20

  // Fetch orders when filters change
  useEffect(() => {
    fetchOrders()
  }, [filters])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await getOrders(filters)
      setOrders(data)
      setCurrentPage(1) // Reset to first page when filters change
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(orders.length / ordersPerPage)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">รายงานยอดขาย</h2>
        <p className="text-gray-600">ดูและส่งออกประวัติการสั่งซื้อ</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-lg">ประวัติการสั่งซื้อ</CardTitle>
            <ExportButton filters={filters} />
          </div>
        </CardHeader>
        <CardContent>
          <FilterBar filters={filters} onFilterChange={handleFilterChange} />
          
          <OrderTable 
            orders={currentOrders}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default SalesReportsPage
