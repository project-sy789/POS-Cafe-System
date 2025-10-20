import React from 'react'
import { Button } from '../ui/button'

const OrderTable = ({ orders, loading, currentPage, totalPages, onPageChange }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return `฿${amount.toFixed(2)}`
  }

  const getStatusBadgeClass = (status) => {
    const baseClass = 'px-2 py-1 text-xs font-medium rounded-full'
    switch (status) {
      case 'Completed':
        return `${baseClass} bg-green-100 text-green-800`
      case 'In Progress':
        return `${baseClass} bg-blue-100 text-blue-800`
      case 'Pending':
        return `${baseClass} bg-yellow-100 text-yellow-800`
      case 'Cancelled':
        return `${baseClass} bg-red-100 text-red-800`
      default:
        return `${baseClass} bg-gray-100 text-gray-800`
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No orders found</p>
      </div>
    )
  }

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto" style={{
        borderRadius: 'var(--theme-radius-sm)',
        border: `1px solid var(--theme-border)`
      }}>
        <table className="w-full">
          <thead style={{
            backgroundColor: 'var(--theme-bg-secondary)',
            borderBottom: `1px solid var(--theme-border)`
          }}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                เลขที่ออเดอร์
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                วันที่และเวลา
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                ลูกค้า
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                พนักงานขาย
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                ประเภท
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                ชำระเงิน
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                ยอดรวม
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
                สถานะ
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'var(--theme-bg-primary)' }}>
            {orders.map((order, index) => (
              <tr 
                key={order._id} 
                className="transition-colors"
                style={{
                  backgroundColor: index % 2 === 0 ? 'var(--theme-bg-primary)' : 'var(--theme-bg-secondary)',
                  borderBottom: `1px solid var(--theme-border)`
                }}
              >
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                  {order.orderNumber}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                  {order.customerName || '-'}
                  {order.tableNumber && ` (โต๊ะ ${order.tableNumber})`}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                  {order.createdBy?.username || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                  {order.orderType === 'Dine-In' ? 'ทานที่ร้าน' : 'ซื้อกลับ'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                  {order.paymentMethod === 'Cash' ? 'เงินสด' : 'QR Code'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                  {formatCurrency(order.total)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={getStatusBadgeClass(order.status)}>
                    {order.status === 'Completed' ? 'เสร็จสิ้น' : 
                     order.status === 'In Progress' ? 'กำลังทำ' :
                     order.status === 'Pending' ? 'รอดำเนินการ' :
                     order.status === 'Cancelled' ? 'ยกเลิก' : order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-4">
          <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderTable
