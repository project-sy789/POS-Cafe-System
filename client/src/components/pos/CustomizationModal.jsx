import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Minus, Plus } from 'lucide-react'

const CustomizationModal = ({ 
  product, 
  isOpen, 
  onClose, 
  onConfirm,
  initialSelections = null,
  initialQuantity = 1
}) => {
  const [selectedOptions, setSelectedOptions] = useState({})
  const [quantity, setQuantity] = useState(initialQuantity)
  const [validationErrors, setValidationErrors] = useState([])

  // Initialize selected options when modal opens or product changes
  useEffect(() => {
    if (isOpen && product) {
      if (initialSelections) {
        // Convert initialSelections array to object format
        const selectionsObj = {}
        initialSelections.forEach(group => {
          selectionsObj[group.groupName] = group.values
        })
        setSelectedOptions(selectionsObj)
      } else {
        // Initialize empty selections
        setSelectedOptions({})
      }
      setQuantity(initialQuantity)
      setValidationErrors([])
    }
  }, [isOpen, product, initialSelections, initialQuantity])

  // Calculate total price including options
  const calculateTotal = () => {
    if (!product) return 0
    
    const basePrice = product.price
    const optionsTotal = Object.values(selectedOptions)
      .flat()
      .reduce((sum, opt) => sum + (opt.priceModifier || 0), 0)
    
    return (basePrice + optionsTotal) * quantity
  }

  // Calculate options total only
  const calculateOptionsTotal = () => {
    return Object.values(selectedOptions)
      .flat()
      .reduce((sum, opt) => sum + (opt.priceModifier || 0), 0)
  }

  // Handle single-select option change (radio button)
  const handleSingleSelect = (groupName, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupName]: [value]
    }))
    // Clear validation error for this group
    setValidationErrors(prev => prev.filter(err => err !== groupName))
  }

  // Handle multi-select option change (checkbox)
  const handleMultiSelect = (groupName, value, isChecked) => {
    setSelectedOptions(prev => {
      const currentValues = prev[groupName] || []
      
      if (isChecked) {
        // Add value
        return {
          ...prev,
          [groupName]: [...currentValues, value]
        }
      } else {
        // Remove value
        const newValues = currentValues.filter(v => v.name !== value.name)
        if (newValues.length === 0) {
          // Remove group if no values selected
          const { [groupName]: removed, ...rest } = prev
          return rest
        }
        return {
          ...prev,
          [groupName]: newValues
        }
      }
    })
  }

  // Check if a value is selected in multi-select group
  const isValueSelected = (groupName, valueName) => {
    const groupValues = selectedOptions[groupName] || []
    return groupValues.some(v => v.name === valueName)
  }

  // Validate required options
  const validateOptions = () => {
    if (!product?.options) return true
    
    const errors = []
    product.options.forEach(group => {
      if (group.required && !selectedOptions[group.groupName]) {
        errors.push(group.groupName)
      }
    })
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  // Handle quantity change
  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  // Handle confirm action
  const handleConfirm = () => {
    if (!validateOptions()) {
      return
    }

    // Convert selectedOptions object to array format for cart
    const selectedOptionsArray = Object.entries(selectedOptions).map(([groupName, values]) => ({
      groupName,
      values
    }))

    onConfirm({
      selectedOptions: selectedOptionsArray,
      quantity,
      basePrice: product.price,
      optionsTotal: calculateOptionsTotal(),
      itemPrice: product.price + calculateOptionsTotal()
    })
  }

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">{product.name}</DialogTitle>
          <div className="text-sm text-gray-600">
            ราคาพื้นฐาน: ฿{product.price.toFixed(2)}
          </div>
        </DialogHeader>

        {/* Body - Option Groups */}
        <div className="space-y-6 py-4">
          {product.options && product.options.length > 0 ? (
            product.options.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                {/* Group Name with Required Indicator */}
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base md:text-lg">
                    {group.groupName}
                    {group.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  {group.type === 'multiple' && (
                    <span className="text-xs text-gray-500">(เลือกได้หลายรายการ)</span>
                  )}
                </div>

                {/* Validation Error */}
                {validationErrors.includes(group.groupName) && (
                  <div className="text-sm text-red-500">
                    กรุณาเลือก {group.groupName}
                  </div>
                )}

                {/* Option Values */}
                <div className="space-y-2">
                  {group.values.map((value, valueIndex) => {
                    const isSelected = group.type === 'single'
                      ? selectedOptions[group.groupName]?.[0]?.name === value.name
                      : isValueSelected(group.groupName, value.name)

                    return (
                      <label
                        key={valueIndex}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {/* Radio or Checkbox */}
                          <input
                            type={group.type === 'single' ? 'radio' : 'checkbox'}
                            name={group.groupName}
                            checked={isSelected}
                            onChange={(e) => {
                              if (group.type === 'single') {
                                handleSingleSelect(group.groupName, value)
                              } else {
                                handleMultiSelect(group.groupName, value, e.target.checked)
                              }
                            }}
                            className="w-4 h-4 md:w-5 md:h-5 text-blue-600 cursor-pointer"
                          />
                          
                          {/* Option Icon (if available) */}
                          {value.iconUrl && (
                            <img
                              src={value.iconUrl}
                              alt={value.name}
                              className="w-8 h-8 md:w-10 md:h-10 object-cover rounded border"
                            />
                          )}
                          
                          {/* Value Name */}
                          <span className="text-sm md:text-base">{value.name}</span>
                        </div>

                        {/* Price Modifier */}
                        {value.priceModifier !== 0 && (
                          <span className={`text-sm md:text-base font-semibold ${
                            value.priceModifier > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {value.priceModifier > 0 ? '+' : ''}฿{value.priceModifier.toFixed(2)}
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-4">
              ไม่มีตัวเลือกสำหรับสินค้านี้
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex-col sm:flex-col gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between w-full">
            <span className="text-sm md:text-base font-medium">จำนวน:</span>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="h-10 w-10 md:h-11 md:w-11"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg md:text-xl font-semibold w-12 text-center">
                {quantity}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                className="h-10 w-10 md:h-11 md:w-11"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total Price Display */}
          <div className="flex items-center justify-between w-full py-3 border-t">
            <span className="text-base md:text-lg font-semibold">ราคารวม:</span>
            <span className="text-xl md:text-2xl font-bold text-blue-600">
              ฿{calculateTotal().toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 min-h-[44px]"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={validationErrors.length > 0 && !validateOptions()}
              className="flex-1 min-h-[44px]"
            >
              เพิ่มลงตะกร้า
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CustomizationModal
