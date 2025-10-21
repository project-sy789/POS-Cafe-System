import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import CashPayment from './CashPayment'
import QRPayment from './QRPayment'

const PaymentModal = ({ isOpen, onClose, total, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('Cash')

  const handlePaymentComplete = (paymentData) => {
    onPaymentComplete({
      ...paymentData,
      paymentMethod,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-y-auto modal-content scrollable-area">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">ชำระเงิน</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6">
          {/* Total Amount Display */}
          <div className="bg-blue-50 p-4 md:p-5 rounded-lg">
            <p className="text-sm md:text-base text-gray-600">ยอดชำระทั้งหมด</p>
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600">
              ฿{total.toFixed(2)}
            </p>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="text-sm md:text-base font-medium text-gray-700 block mb-2">
              วิธีการชำระเงิน
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={paymentMethod === 'Cash' ? 'default' : 'outline'}
                className="min-h-[52px] md:min-h-[56px] text-base touch-manipulation"
                onClick={() => setPaymentMethod('Cash')}
              >
                💵 เงินสด
              </Button>
              <Button
                variant={paymentMethod === 'QRCode' ? 'default' : 'outline'}
                className="min-h-[52px] md:min-h-[56px] text-base touch-manipulation"
                onClick={() => setPaymentMethod('QRCode')}
              >
                📱 QR Code
              </Button>
            </div>
          </div>

          {/* Payment Method Component */}
          <div className="border-t pt-4">
            {paymentMethod === 'Cash' ? (
              <CashPayment
                total={total}
                onComplete={handlePaymentComplete}
                onCancel={onClose}
              />
            ) : (
              <QRPayment
                total={total}
                onComplete={handlePaymentComplete}
                onCancel={onClose}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentModal
