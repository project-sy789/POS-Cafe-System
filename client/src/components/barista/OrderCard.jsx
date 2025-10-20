import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { updateOrderStatus } from '../../services/orderService'
import { useState } from 'react'

const OrderCard = ({ order, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true)
    try {
      await updateOrderStatus(order._id, newStatus)
      if (onStatusUpdate) {
        onStatusUpdate(order._id, newStatus)
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getNextStatus = (currentStatus) => {
    if (currentStatus === 'Pending') return 'In Progress'
    if (currentStatus === 'In Progress') return 'Completed'
    return null
  }

  const nextStatus = getNextStatus(order.status)

  return (
    <Card 
      className={`p-3 md:p-4 ${getStatusColor(order.status)}`}
      style={{
        borderWidth: '1px',
        borderColor: 'var(--theme-border)',
        boxShadow: 'var(--theme-shadow-sm)',
        borderRadius: 'var(--theme-radius-md)'
      }}
    >
      <div className="space-y-3">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div className="flex-1">
            <h3 
              className="text-lg md:text-xl font-bold"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              {order.orderNumber}
            </h3>
            <p 
              className="text-xs md:text-sm"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              {order.orderType === 'Dine-In' ? 'ทานที่ร้าน' : 'ซื้อกลับ'} 
              {order.tableNumber && ` • โต๊ะ ${order.tableNumber}`}
              {order.customerName && ` • ${order.customerName}`}
            </p>
          </div>
          <div className="text-right">
            <span 
              className={`px-2 md:px-3 py-1 text-xs md:text-sm font-medium ${getStatusColor(order.status)}`}
              style={{ borderRadius: 'var(--theme-radius-sm)' }}
            >
              {order.status === 'Pending' ? 'รอดำเนินการ' :
               order.status === 'In Progress' ? 'กำลังทำ' :
               order.status === 'Completed' ? 'เสร็จสิ้น' :
               order.status === 'Cancelled' ? 'ยกเลิก' : order.status}
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div 
              key={index} 
              className="flex justify-between items-start p-2 md:p-3"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderWidth: '1px',
                borderColor: 'var(--theme-border)',
                borderRadius: 'var(--theme-radius-sm)'
              }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span 
                    className="font-semibold text-base md:text-lg"
                    style={{ color: 'var(--theme-text-primary)' }}
                  >
                    {item.quantity}x
                  </span>
                  <span 
                    className="font-medium text-sm md:text-base"
                    style={{ color: 'var(--theme-text-primary)' }}
                  >
                    {item.productSnapshot?.name || item.product?.name || 'Unknown Item'}
                  </span>
                </div>
                
                {/* Display selected options */}
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <div className="ml-6 md:ml-8 mt-1 space-y-0.5">
                    {item.selectedOptions.map((group, groupIndex) => (
                      <div key={groupIndex} className="text-xs md:text-sm">
                        <span 
                          className="font-medium"
                          style={{ color: 'var(--theme-text-secondary)' }}
                        >
                          {group.groupName}:
                        </span>{' '}
                        <span style={{ color: 'var(--theme-text-primary)' }}>
                          {group.values.map(value => value.name).join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {item.customizationNotes && (
                  <p 
                    className="text-xs md:text-sm ml-6 md:ml-8 italic mt-1"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    หมายเหตุ: {item.customizationNotes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order Time */}
        <div 
          className="text-xs md:text-sm"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          สั่งเมื่อ: {new Date(order.createdAt).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {nextStatus && (
            <Button
              onClick={() => handleStatusUpdate(nextStatus)}
              disabled={isUpdating}
              className="flex-1 min-h-[48px] md:min-h-[52px] text-base touch-manipulation"
            >
              {isUpdating ? 'กำลังอัพเดท...' : 
               nextStatus === 'In Progress' ? 'เริ่มทำ' : 
               nextStatus === 'Completed' ? 'เสร็จสิ้น' : nextStatus}
            </Button>
          )}
          <Button
            onClick={() => handleStatusUpdate('Cancelled')}
            disabled={isUpdating}
            variant="outline"
            className="min-h-[48px] md:min-h-[52px] text-base touch-manipulation border-red-300 text-red-600 hover:bg-red-50"
          >
            ยกเลิก
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default OrderCard
