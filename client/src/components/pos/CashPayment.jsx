import { useState, useEffect } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const CashPayment = ({ total, onComplete, onCancel }) => {
  const [cashReceived, setCashReceived] = useState('')
  const [error, setError] = useState('')

  const cashAmount = parseFloat(cashReceived) || 0
  const change = cashAmount - total

  useEffect(() => {
    // Clear error when cash amount changes
    if (error && cashAmount >= total) {
      setError('')
    }
  }, [cashAmount, total, error])

  const handleConfirm = () => {
    if (!cashReceived || cashAmount <= 0) {
      setError('กรุณาระบุจำนวนเงินที่รับมา')
      return
    }

    if (cashAmount < total) {
      setError('จำนวนเงินไม่เพียงพอ')
      return
    }

    // Payment successful
    onComplete({
      cashReceived: cashAmount,
      changeGiven: change,
    })
  }

  const handleQuickAmount = (amount) => {
    setCashReceived(amount.toString())
  }

  // Generate quick amount buttons (rounded up amounts)
  const quickAmounts = [
    Math.ceil(total / 100) * 100,
    Math.ceil(total / 500) * 500,
    Math.ceil(total / 1000) * 1000,
  ].filter((amount, index, arr) => arr.indexOf(amount) === index) // Remove duplicates

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm md:text-base font-medium text-gray-700 block mb-2">
          รับเงินสด
        </label>
        <Input
          type="number"
          placeholder="ระบุจำนวนเงิน"
          value={cashReceived}
          onChange={(e) => setCashReceived(e.target.value)}
          className="text-base md:text-lg min-h-[48px]"
          min="0"
          step="0.01"
          autoFocus
        />
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}
      </div>

      {/* Quick Amount Buttons */}
      <div>
        <label className="text-sm md:text-base font-medium text-gray-700 block mb-2">
          จำนวนเงินด่วน
        </label>
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              onClick={() => handleQuickAmount(amount)}
              className="min-h-[48px] md:min-h-[52px] text-base touch-manipulation"
            >
              ฿{amount}
            </Button>
          ))}
        </div>
      </div>

      {/* Change Display */}
      {cashAmount > 0 && (
        <div className="bg-gray-50 p-4 md:p-5 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm md:text-base text-gray-600">เงินทอน</span>
            <span className={`text-xl md:text-2xl lg:text-3xl font-bold ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ฿{change >= 0 ? change.toFixed(2) : '0.00'}
            </span>
          </div>
          {change < 0 && (
            <p className="text-xs md:text-sm text-red-600 mt-1">
              ต้องการอีก ฿{Math.abs(change).toFixed(2)}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 min-h-[48px] md:min-h-[52px] text-base touch-manipulation"
        >
          ยกเลิก
        </Button>
        <Button
          onClick={handleConfirm}
          className="flex-1 min-h-[48px] md:min-h-[52px] text-base touch-manipulation"
          disabled={cashAmount < total}
        >
          ยืนยันการชำระเงิน
        </Button>
      </div>
    </div>
  )
}

export default CashPayment
