import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import generatePayload from 'promptpay-qr'
import QRCode from 'qrcode'
import api from '../../services/api'

const QRPayment = ({ total, onComplete, onCancel }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [promptPayId, setPromptPayId] = useState('')

  useEffect(() => {
    // Fetch PromptPay settings and generate QR code
    const fetchSettingsAndGenerateQR = async () => {
      try {
        setLoading(true)
        setError('')

        console.log('Fetching settings for QR code generation...')

        // Fetch settings to get PromptPay ID
        const response = await api.get('/settings')
        const settings = response.data

        console.log('Settings received:', settings)

        if (!settings.promptPayId) {
          setError('ยังไม่ได้ตั้งค่า PromptPay ID กรุณาติดต่อผู้จัดการ')
          setLoading(false)
          return
        }

        setPromptPayId(settings.promptPayId)

        console.log('Generating QR code for:', settings.promptPayId, 'Amount:', total)

        // Generate PromptPay QR code payload
        const payload = generatePayload(settings.promptPayId, { amount: total })

        console.log('Payload generated:', payload)

        // Convert payload to QR code image
        const qrDataUrl = await QRCode.toDataURL(payload, {
          width: 300,
          margin: 2,
        })

        console.log('QR code generated successfully')

        setQrCodeUrl(qrDataUrl)
        setLoading(false)
      } catch (err) {
        console.error('Error generating QR code:', err)
        console.error('Error details:', err.message, err.response?.data)
        setError(`ไม่สามารถสร้าง QR Code ได้: ${err.message || 'กรุณาลองใหม่อีกครั้ง'}`)
        setLoading(false)
      }
    }

    fetchSettingsAndGenerateQR()
  }, [total])

  const handleConfirmPayment = () => {
    // Payment confirmed by cashier
    onComplete({
      qrCodeGenerated: true,
      promptPayId,
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">กำลังสร้าง QR Code...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 min-h-[48px]"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="flex-1 min-h-[48px]"
          >
            ลองใหม่
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* QR Code Display */}
      <div className="flex flex-col items-center">
        <div className="bg-white p-3 md:p-4 rounded-lg border-2 border-gray-200">
          {qrCodeUrl && (
            <img
              src={qrCodeUrl}
              alt="PromptPay QR Code"
              className="w-56 h-56 md:w-64 md:h-64"
            />
          )}
        </div>
        <p className="text-sm md:text-base text-gray-600 mt-3 text-center font-semibold">
          สแกน QR Code เพื่อชำระเงิน
        </p>
        <p className="text-lg md:text-xl text-blue-600 font-bold mt-2">
          ยอดชำระ: ฿{total.toFixed(2)}
        </p>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          PromptPay ID: {promptPayId}
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
        <p className="text-sm md:text-base text-blue-900 font-medium mb-2">
          วิธีการชำระเงิน:
        </p>
        <ol className="text-xs md:text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>ลูกค้าสแกน QR Code ด้วยแอปธนาคาร</li>
          <li>ตรวจสอบยอดเงินให้ถูกต้อง</li>
          <li>ลูกค้ายืนยันการชำระเงินในแอป</li>
          <li>เมื่อได้รับเงินแล้ว กดปุ่ม "ยืนยันการชำระเงิน"</li>
        </ol>
      </div>

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
          onClick={handleConfirmPayment}
          className="flex-1 min-h-[48px] md:min-h-[52px] text-base touch-manipulation bg-green-600 hover:bg-green-700"
        >
          ยืนยันการชำระเงิน
        </Button>
      </div>
    </div>
  )
}

export default QRPayment
