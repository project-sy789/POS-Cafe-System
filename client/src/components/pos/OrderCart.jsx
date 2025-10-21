import { useState, useEffect } from 'react'
import useCartStore from '../../store/cartStore'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Trash2, Plus, Minus, Edit2 } from 'lucide-react'
import api from '../../services/api'
import CustomizationModal from './CustomizationModal'

const OrderCart = ({ onCheckout }) => {
  const {
    items,
    customerName,
    tableNumber,
    orderType,
    updateQuantity,
    removeItem,
    updateCustomization,
    updateItem,
    setCustomerName,
    setTableNumber,
    setOrderType,
    getSubtotal,
    getTax,
    getTotal,
    getBasePrice,
  } = useCartStore()

  const [expandedItemId, setExpandedItemId] = useState(null)
  const [taxRate, setTaxRate] = useState(7)
  const [taxIncludedInPrice, setTaxIncludedInPrice] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false)

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

  const subtotal = getSubtotal()
  const basePrice = getBasePrice(taxRate, taxIncludedInPrice)
  const tax = getTax(taxRate, taxIncludedInPrice)
  const total = getTotal(taxRate, taxIncludedInPrice)

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 0) {
      updateQuantity(productId, newQuantity)
    }
  }

  const toggleItemExpansion = (productId) => {
    setExpandedItemId(expandedItemId === productId ? null : productId)
  }

  const handleEditItem = (item) => {
    // Only allow editing if product has options
    if (item.product.options && item.product.options.length > 0) {
      setEditingItem(item)
      setIsCustomizationModalOpen(true)
    }
  }

  const handleCustomizationConfirm = (customizationData) => {
    if (editingItem) {
      updateItem(editingItem.product._id, {
        selectedOptions: customizationData.selectedOptions,
        quantity: customizationData.quantity,
        basePrice: customizationData.basePrice,
        optionsTotal: customizationData.optionsTotal,
        itemPrice: customizationData.itemPrice
      })
      setIsCustomizationModalOpen(false)
      setEditingItem(null)
    }
  }

  const handleCustomizationClose = () => {
    setIsCustomizationModalOpen(false)
    setEditingItem(null)
  }

  return (
    <div 
      style={{ 
        backgroundColor: 'var(--theme-bg-primary)',
        boxShadow: 'var(--theme-shadow-lg)'
      }}
      className="flex flex-col h-full border-t-2 md:border-t-0"
    >
      {/* Header */}
      <div 
        style={{ borderColor: 'var(--theme-border)' }}
        className="p-3 md:p-4 border-b"
      >
        <h2 
          style={{ color: 'var(--theme-text-primary)' }}
          className="text-lg md:text-xl font-bold"
        >
          ออเดอร์ปัจจุบัน
        </h2>
        <p 
          style={{ color: 'var(--theme-text-secondary)' }}
          className="text-xs md:text-sm"
        >
          {items.length} รายการ
        </p>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 cart-container scrollable-area">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-6xl mb-4">🛒</div>
            <p>ตะกร้าว่างเปล่า</p>
            <p className="text-sm">เพิ่มสินค้าเพื่อเริ่มต้น</p>
          </div>
        ) : (
          items.map((item) => (
            <Card 
              key={item.product._id} 
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border)',
                boxShadow: 'var(--theme-shadow-sm)',
                borderRadius: 'var(--theme-radius-md)',
              }}
              className="p-3 md:p-4 border"
            >
              <div className="flex items-start gap-2 md:gap-3">
                {/* Product Image */}
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    style={{ borderRadius: 'var(--theme-radius-sm)' }}
                    className="w-14 h-14 md:w-16 md:h-16 object-cover"
                  />
                ) : (
                  <div 
                    style={{ 
                      backgroundColor: 'var(--theme-bg-secondary)',
                      borderRadius: 'var(--theme-radius-sm)'
                    }}
                    className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center"
                  >
                    <span className="text-xl md:text-2xl">🍽️</span>
                  </div>
                )}

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 
                    style={{ color: 'var(--theme-text-primary)' }}
                    className="font-semibold text-sm md:text-base line-clamp-1"
                  >
                    {item.product.name}
                  </h3>
                  <p 
                    style={{ color: 'var(--theme-bg-accent)' }}
                    className="text-sm md:text-base font-semibold"
                  >
                    ฿{item.product.price.toFixed(2)}
                  </p>

                  {/* Display Selected Options */}
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {item.selectedOptions.map((group, groupIndex) => (
                        <div key={groupIndex} className="text-xs md:text-sm text-gray-700">
                          <span className="font-medium">{group.groupName}:</span>{' '}
                          <span>
                            {group.values.map((value, valueIndex) => (
                              <span key={valueIndex}>
                                {value.name}
                                {value.priceModifier !== 0 && (
                                  <span className={`ml-1 font-semibold ${
                                    value.priceModifier > 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    ({value.priceModifier > 0 ? '+' : ''}฿{value.priceModifier.toFixed(2)})
                                  </span>
                                )}
                                {valueIndex < group.values.length - 1 && ', '}
                              </span>
                            ))}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 w-9 md:h-10 md:w-10 p-0 touch-manipulation min-h-[44px] min-w-[44px]"
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm md:text-base font-semibold w-8 md:w-10 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 w-9 md:h-10 md:w-10 p-0 touch-manipulation min-h-[44px] min-w-[44px]"
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <div className="ml-auto text-right">
                      {/* Show price breakdown if options exist */}
                      {item.optionsTotal !== undefined && item.optionsTotal !== 0 ? (
                        <div className="space-y-0.5">
                          <div 
                            style={{ color: 'var(--theme-text-secondary)' }}
                            className="text-xs"
                          >
                            ฿{item.basePrice.toFixed(2)} + ฿{item.optionsTotal.toFixed(2)}
                          </div>
                          <div 
                            style={{ color: 'var(--theme-bg-accent)' }}
                            className="text-sm md:text-base font-semibold"
                          >
                            ฿{item.itemTotal.toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <span 
                          style={{ color: 'var(--theme-text-primary)' }}
                          className="text-sm md:text-base font-semibold"
                        >
                          ฿{(item.itemTotal || item.product.price * item.quantity).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customization Toggle */}
                  <button
                    onClick={() => toggleItemExpansion(item.product._id)}
                    className="text-xs md:text-sm text-blue-600 hover:underline mt-2 min-h-[44px] flex items-center touch-manipulation"
                  >
                    {expandedItemId === item.product._id ? 'ซ่อนหมายเหตุ' : 'เพิ่มหมายเหตุ'}
                  </button>

                  {/* Customization Input */}
                  {expandedItemId === item.product._id && (
                    <Input
                      placeholder="เช่น หวานน้อย, เปลี่ยนเป็นนมโอ๊ต"
                      value={item.customizationNotes}
                      onChange={(e) => updateCustomization(item.product._id, e.target.value)}
                      className="mt-2 text-sm md:text-base min-h-[44px]"
                    />
                  )}

                  {/* Display existing notes */}
                  {item.customizationNotes && expandedItemId !== item.product._id && (
                    <p className="text-xs md:text-sm text-gray-600 mt-1 italic">
                      หมายเหตุ: {item.customizationNotes}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-1">
                  {/* Edit Button - only show if product has options */}
                  {item.product.options && item.product.options.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-10 w-10 md:h-11 md:w-11 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50 touch-manipulation min-h-[44px] min-w-[44px]"
                      onClick={() => handleEditItem(item)}
                      title="แก้ไขตัวเลือก"
                    >
                      <Edit2 className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  )}
                  
                  {/* Remove Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 w-10 md:h-11 md:w-11 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 touch-manipulation min-h-[44px] min-w-[44px]"
                    onClick={() => removeItem(item.product._id)}
                    title="ลบรายการ"
                  >
                    <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Order Details Form */}
      {items.length > 0 && (
        <div 
          style={{ borderColor: 'var(--theme-border)' }}
          className="border-t p-3 md:p-4 space-y-3"
        >
          <div>
            <label 
              style={{ color: 'var(--theme-text-primary)' }}
              className="text-sm md:text-base font-medium"
            >
              ชื่อลูกค้า
            </label>
            <Input
              placeholder="ระบุชื่อลูกค้า (ไม่บังคับ)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 min-h-[44px] text-base"
            />
          </div>

          <div>
            <label 
              style={{ color: 'var(--theme-text-primary)' }}
              className="text-sm md:text-base font-medium"
            >
              หมายเลขโต๊ะ
            </label>
            <Input
              placeholder="ระบุหมายเลขโต๊ะ (ไม่บังคับ)"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="mt-1 min-h-[44px] text-base"
            />
          </div>

          <div>
            <label 
              style={{ color: 'var(--theme-text-primary)' }}
              className="text-sm md:text-base font-medium block mb-2"
            >
              ประเภทออเดอร์
            </label>
            <div className="flex gap-2">
              <Button
                variant={orderType === 'Dine-In' ? 'default' : 'outline'}
                className="flex-1 min-h-[48px] md:min-h-[52px] text-base touch-manipulation"
                onClick={() => setOrderType('Dine-In')}
              >
                ทานที่ร้าน
              </Button>
              <Button
                variant={orderType === 'Take Away' ? 'default' : 'outline'}
                className="flex-1 min-h-[48px] md:min-h-[52px] text-base touch-manipulation"
                onClick={() => setOrderType('Take Away')}
              >
                ซื้อกลับ
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Totals */}
      {items.length > 0 && (
        <div 
          style={{ borderColor: 'var(--theme-border)' }}
          className="border-t p-3 md:p-4 space-y-2 fixed-bottom-buttons sticky-buttons"
        >
          {taxIncludedInPrice ? (
            <>
              <div className="flex justify-between text-sm md:text-base">
                <span style={{ color: 'var(--theme-text-secondary)' }}>ยอดรวม (รวมภาษี)</span>
                <span style={{ color: 'var(--theme-text-primary)' }} className="font-semibold">฿{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span style={{ color: 'var(--theme-text-secondary)' }}>ราคาสินค้า</span>
                <span style={{ color: 'var(--theme-text-secondary)' }}>฿{basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span style={{ color: 'var(--theme-text-secondary)' }}>ภาษี {taxRate}% (รวมในราคา)</span>
                <span style={{ color: 'var(--theme-text-secondary)' }}>฿{tax.toFixed(2)}</span>
              </div>
              <div 
                style={{ borderColor: 'var(--theme-border)' }}
                className="flex justify-between text-base md:text-lg lg:text-xl font-bold border-t pt-2"
              >
                <span style={{ color: 'var(--theme-text-primary)' }}>ยอดชำระทั้งหมด</span>
                <span style={{ color: 'var(--theme-bg-accent)' }}>฿{total.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm md:text-base">
                <span style={{ color: 'var(--theme-text-secondary)' }}>ยอดรวม</span>
                <span style={{ color: 'var(--theme-text-primary)' }} className="font-semibold">฿{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span style={{ color: 'var(--theme-text-secondary)' }}>ภาษี ({taxRate}%)</span>
                <span style={{ color: 'var(--theme-text-primary)' }} className="font-semibold">฿{tax.toFixed(2)}</span>
              </div>
              <div 
                style={{ borderColor: 'var(--theme-border)' }}
                className="flex justify-between text-base md:text-lg lg:text-xl font-bold border-t pt-2"
              >
                <span style={{ color: 'var(--theme-text-primary)' }}>ยอดชำระทั้งหมด</span>
                <span style={{ color: 'var(--theme-bg-accent)' }}>฿{total.toFixed(2)}</span>
              </div>
            </>
          )}

          <Button
            className="w-full mt-4 min-h-[52px] md:min-h-[56px] text-base md:text-lg touch-manipulation"
            size="lg"
            onClick={onCheckout}
          >
            ดำเนินการชำระเงิน
          </Button>
        </div>
      )}

      {/* Customization Modal for Editing */}
      {editingItem && (
        <CustomizationModal
          product={editingItem.product}
          isOpen={isCustomizationModalOpen}
          onClose={handleCustomizationClose}
          onConfirm={handleCustomizationConfirm}
          initialSelections={editingItem.selectedOptions}
          initialQuantity={editingItem.quantity}
        />
      )}
    </div>
  )
}

export default OrderCart
