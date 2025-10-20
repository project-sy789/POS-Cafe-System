import { useState, useEffect } from 'react'
import { getOrders } from '../../services/orderService'
import useSocket from '../../hooks/useSocket'
import OrderCard from './OrderCard'

const OrderQueue = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch initial orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        // Fetch all orders and filter client-side for non-completed orders
        const data = await getOrders({})
        // Filter for Pending and In Progress orders only
        const activeOrders = data.filter(order => 
          order.status === 'Pending' || order.status === 'In Progress'
        )
        // Sort by creation time (oldest first)
        const sortedOrders = activeOrders.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        )
        setOrders(sortedOrders)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch orders:', err)
        setError('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Listen for new orders via Socket.IO
  useSocket('new_order', (newOrder) => {
    setOrders(prevOrders => {
      // Add new order and sort by creation time
      const updatedOrders = [...prevOrders, newOrder]
      return updatedOrders.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      )
    })
  })

  // Listen for order status updates via Socket.IO
  useSocket('update_order_status', ({ orderId, status, updatedAt }) => {
    setOrders(prevOrders => {
      // If order is completed or cancelled, remove it from the queue
      if (status === 'Completed' || status === 'Cancelled') {
        return prevOrders.filter(order => order._id !== orderId)
      }
      
      // Otherwise, update the order status
      return prevOrders.map(order => 
        order._id === orderId 
          ? { ...order, status, updatedAt }
          : order
      )
    })
  })

  // Handle local status update
  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(prevOrders => {
      // If order is completed or cancelled, remove it from the queue
      if (newStatus === 'Completed' || newStatus === 'Cancelled') {
        return prevOrders.filter(order => order._id !== orderId)
      }
      
      // Otherwise, update the order status
      return prevOrders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      )
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">กำลังโหลดออเดอร์...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">☕</div>
          <div className="text-lg text-gray-600">ไม่มีออเดอร์ที่รอดำเนินการ</div>
          <div className="text-sm text-gray-500 mt-2">ออเดอร์ใหม่จะปรากฏที่นี่โดยอัตโนมัติ</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h2 
          className="text-xl md:text-2xl font-bold"
          style={{ color: 'var(--theme-text-primary)' }}
        >
          คิวออเดอร์
        </h2>
        <div 
          className="text-sm md:text-base"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          {orders.length} ออเดอร์รอดำเนินการ
        </div>
      </div>
      
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
        style={{ backgroundColor: 'transparent' }}
      >
        {orders.map(order => (
          <OrderCard 
            key={order._id} 
            order={order}
            onStatusUpdate={handleStatusUpdate}
          />
        ))}
      </div>
    </div>
  )
}

export default OrderQueue
