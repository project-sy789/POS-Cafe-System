import { useState, useEffect } from 'react'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import CategoryGrid from '../components/pos/CategoryGrid'
import MenuGrid from '../components/pos/MenuGrid'
import OrderCart from '../components/pos/OrderCart'
import PaymentModal from '../components/pos/PaymentModal'
import ReceiptModal from '../components/pos/ReceiptModal'
import { Button } from '../components/ui/button'
import { LogOut } from 'lucide-react'
import { createOrder } from '../services/orderService'
import api from '../services/api'
import toast from 'react-hot-toast'

const POSPage = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const [taxRate, setTaxRate] = useState(7)
  const [taxIncludedInPrice, setTaxIncludedInPrice] = useState(false)
  
  const { addItem, items, customerName, tableNumber, orderType, getSubtotal, getTax, getTotal, clearCart } = useCartStore()
  const { user, logout } = useAuthStore()

  // Fetch tax settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings')
        setTaxRate(response.data.taxRate || 7)
        setTaxIncludedInPrice(response.data.taxIncludedInPrice || false)
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    fetchSettings()
  }, [])

  const total = getTotal(taxRate, taxIncludedInPrice)

  const handleAddToCart = (product, quantity = 1, selectedOptions = []) => {
    addItem(product, quantity, selectedOptions)
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Cart is empty')
      return
    }
    setIsPaymentModalOpen(true)
  }

  const handlePaymentComplete = async (paymentData) => {
    try {
      setIsProcessing(true)

      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          customizationNotes: item.customizationNotes || '',
          itemTotal: item.product.price * item.quantity,
        })),
        subtotal: getSubtotal(),
        tax: getTax(taxRate, taxIncludedInPrice),
        total: total,
        paymentMethod: paymentData.paymentMethod,
        customerName: customerName || '',
        tableNumber: tableNumber || '',
        orderType: orderType,
        cashReceived: paymentData.cashReceived || 0,
        changeGiven: paymentData.changeGiven || 0,
      }

      // Create order
      const order = await createOrder(orderData)

      // Success
      toast.success(`Order ${order.orderNumber} created successfully!`)
      
      // Close payment modal and show receipt
      setIsPaymentModalOpen(false)
      setCompletedOrder(order)
      setIsReceiptModalOpen(true)
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to create order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div 
      style={{ backgroundColor: 'var(--theme-bg-secondary)' }}
      className="h-screen flex flex-col"
    >
      {/* Header */}
      <header 
        style={{ 
          backgroundColor: 'var(--theme-bg-primary)',
          borderColor: 'var(--theme-border)'
        }}
        className="border-b px-4 md:px-6 py-3 md:py-4 flex items-center justify-between"
      >
        <div>
          <h1 
            style={{ color: 'var(--theme-text-primary)' }}
            className="text-xl md:text-2xl lg:text-3xl font-bold"
          >
            ระบบขายหน้าร้าน (POS)
          </h1>
          <p 
            style={{ color: 'var(--theme-text-secondary)' }}
            className="text-xs md:text-sm"
          >
            ผู้ใช้: <span className="font-semibold">{user?.username}</span> ({user?.role})
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Navigation Buttons */}
          {user?.role === 'Manager' && (
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'} 
              size="default" 
              className="min-h-[44px]"
            >
              <span className="text-lg mr-2">📊</span>
              <span className="hidden md:inline">แดชบอร์ด</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/barista'} 
            size="default" 
            className="min-h-[44px]"
          >
            <span className="text-lg mr-2">☕</span>
            <span className="hidden md:inline">Barista</span>
          </Button>
          <Button variant="outline" onClick={handleLogout} size="default" className="min-h-[44px] min-w-[44px]">
            <LogOut className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">ออกจากระบบ</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side - Menu Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Categories Section */}
          <div 
            style={{ 
              backgroundColor: 'var(--theme-bg-primary)',
              borderColor: 'var(--theme-border)'
            }}
            className="border-b p-3 md:p-4 lg:p-6"
          >
            <h2 
              style={{ color: 'var(--theme-text-primary)' }}
              className="text-base md:text-lg lg:text-xl font-semibold mb-3"
            >
              หมวดหมู่
            </h2>
            <CategoryGrid
              onSelectCategory={setSelectedCategoryId}
              selectedCategoryId={selectedCategoryId}
              onFeaturedProductsChange={setFeaturedProducts}
            />
          </div>

          {/* Products Section */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 pb-[70vh] md:pb-6">
            <h2 
              style={{ color: 'var(--theme-text-primary)' }}
              className="text-base md:text-lg lg:text-xl font-semibold mb-3"
            >
              {selectedCategoryId ? 'สินค้า' : 'เลือกหมวดหมู่'}
            </h2>
            <MenuGrid
              categoryId={selectedCategoryId}
              onAddToCart={handleAddToCart}
              featuredProducts={featuredProducts}
            />
          </div>
        </div>

        {/* Right Side - Cart Sidebar (Desktop: sidebar, Mobile: fixed bottom) */}
        <div 
          style={{ 
            backgroundColor: 'var(--theme-bg-primary)',
            borderColor: 'var(--theme-border)'
          }}
          className="fixed bottom-0 left-0 right-0 md:relative md:w-96 lg:w-[28rem] xl:w-[32rem] md:border-l flex flex-col max-h-[65vh] md:max-h-none z-40"
        >
          <OrderCart onCheckout={handleCheckout} />
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => !isProcessing && setIsPaymentModalOpen(false)}
        total={total}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        order={completedOrder}
        onAfterClose={clearCart}
      />
    </div>
  )
}

export default POSPage
