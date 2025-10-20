import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Printer, X } from 'lucide-react'
import api from '../../services/api'

const ReceiptModal = ({ isOpen, onClose, order, onAfterClose }) => {
  const [taxIncludedInPrice, setTaxIncludedInPrice] = useState(false)
  const [storeInfo, setStoreInfo] = useState({
    storeName: 'ระบบ POS คาเฟ่',
    address: '',
    phone: ''
  })

  // Fetch settings including store info
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings')
        setTaxIncludedInPrice(response.data.taxIncludedInPrice || false)
        setStoreInfo({
          storeName: response.data.storeName || 'ระบบ POS คาเฟ่',
          address: response.data.address || '',
          phone: response.data.phone || ''
        })
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    if (isOpen) {
      fetchSettings()
    }
  }, [isOpen])

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleClose = () => {
    onClose()
    // Clear cart after receipt is closed
    if (onAfterClose) {
      onAfterClose()
    }
  }

  // Prevent closing while printing
  useEffect(() => {
    const handleBeforePrint = () => {
      // Optional: Add print-specific styling
    }

    const handleAfterPrint = () => {
      // Optional: Clean up after printing
    }

    window.addEventListener('beforeprint', handleBeforePrint)
    window.addEventListener('afterprint', handleAfterPrint)

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint)
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [])

  if (!order) return null

  const { date, time } = formatDateTime(order.createdAt)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] print:shadow-none print:border-0">
        <DialogHeader className="print:hidden">
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>

        {/* Receipt Content */}
        <div className="receipt-content space-y-4" id="receipt">
          {/* Store Header */}
          <div className="text-center border-b pb-4">
            <h2 className="text-2xl font-bold">{storeInfo.storeName}</h2>
            {storeInfo.address && (
              <p className="text-sm text-gray-600 mt-1">{storeInfo.address}</p>
            )}
            {storeInfo.phone && (
              <p className="text-sm text-gray-600">โทร: {storeInfo.phone}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">ขอบคุณที่ใช้บริการ!</p>
          </div>

          {/* Order Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold">เลขที่ออเดอร์:</span>
              <span className="font-mono">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">วันที่:</span>
              <span>{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">เวลา:</span>
              <span>{time}</span>
            </div>
            {order.customerName && (
              <div className="flex justify-between">
                <span className="font-semibold">ลูกค้า:</span>
                <span>{order.customerName}</span>
              </div>
            )}
            {order.tableNumber && (
              <div className="flex justify-between">
                <span className="font-semibold">โต๊ะ:</span>
                <span>{order.tableNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-semibold">ประเภท:</span>
              <span>{order.orderType === 'Dine-In' ? 'ทานที่ร้าน' : 'ซื้อกลับ'}</span>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-b py-4">
            <h3 className="font-semibold mb-3">รายการสินค้า</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="flex-1">
                      {item.productSnapshot?.name || item.product?.name || 'Unknown Item'}
                    </span>
                    <span className="text-gray-600 mx-2">
                      x{item.quantity}
                    </span>
                    <span className="font-semibold w-20 text-right">
                      ฿{item.itemTotal.toFixed(2)}
                    </span>
                  </div>
                  {/* Display selected options */}
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div className="pl-4 space-y-0.5">
                      {item.selectedOptions.map((group, groupIndex) => (
                        <div key={groupIndex} className="text-xs text-gray-600">
                          {group.values.map((value, valueIndex) => (
                            <div key={valueIndex} className="flex justify-between">
                              <span>- {value.name}</span>
                              {value.priceModifier !== 0 && (
                                <span className="text-gray-500">
                                  ({value.priceModifier > 0 ? '+' : ''}฿{value.priceModifier.toFixed(2)})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  {item.customizationNotes && (
                    <div className="text-xs text-gray-500 italic pl-2">
                      หมายเหตุ: {item.customizationNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2">
            {taxIncludedInPrice ? (
              <>
                <div className="flex justify-between text-sm">
                  <span>ยอดรวม (รวมภาษี):</span>
                  <span>฿{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="pl-2">- ราคาสินค้า:</span>
                  <span>฿{(order.subtotal - order.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="pl-2">- ภาษี (รวมในราคา):</span>
                  <span>฿{order.tax.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span>ยอดรวม:</span>
                  <span>฿{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ภาษี (7%):</span>
                  <span>฿{order.tax.toFixed(2)}</span>
                </div>
              </>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>ส่วนลด:</span>
                <span>-฿{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>ยอดชำระทั้งหมด:</span>
              <span>฿{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold">วิธีชำระเงิน:</span>
              <span>{order.paymentMethod === 'Cash' ? '💵 เงินสด' : '📱 QR Code'}</span>
            </div>
            {order.paymentMethod === 'Cash' && order.cashReceived > 0 && (
              <>
                <div className="flex justify-between">
                  <span>รับเงิน:</span>
                  <span>฿{order.cashReceived.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>เงินทอน:</span>
                  <span>฿{order.changeGiven.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 border-t pt-4">
            <p>ขอบคุณที่ใช้บริการ กรุณามาอีกนะคะ!</p>
            {storeInfo.phone && (
              <p className="text-xs mt-1">สอบถามเพิ่มเติม: {storeInfo.phone}</p>
            )}
            <p className="text-xs mt-2">{storeInfo.storeName}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 print:hidden">
          <Button
            onClick={handlePrint}
            className="flex-1"
            variant="default"
          >
            <Printer className="h-4 w-4 mr-2" />
            พิมพ์ใบเสร็จ
          </Button>
          <Button
            onClick={handleClose}
            className="flex-1"
            variant="outline"
          >
            <X className="h-4 w-4 mr-2" />
            ปิด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReceiptModal
