import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      customerName: '',
      tableNumber: '',
      orderType: 'Dine-In',

  addItem: (product, quantity = 1, selectedOptions = [], customizationNotes = '') => set((state) => {
    // Calculate price breakdown
    const basePrice = product.price
    const optionsTotal = (selectedOptions || []).reduce((sum, group) => {
      return sum + group.values.reduce((valSum, val) => valSum + (val.priceModifier || 0), 0)
    }, 0)
    const itemPrice = basePrice + optionsTotal
    const itemTotal = itemPrice * quantity
    
    // Check if same product with same options exists
    const existingItem = state.items.find(item => 
      item.product._id === product._id && 
      JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
    )
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity
      return {
        items: state.items.map(item =>
          item.product._id === product._id && 
          JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
            ? { 
                ...item, 
                quantity: newQuantity,
                itemTotal: itemPrice * newQuantity
              }
            : item
        )
      }
    }
    
    return {
      items: [...state.items, {
        product,
        quantity,
        customizationNotes,
        selectedOptions: selectedOptions || [],
        basePrice,
        optionsTotal,
        itemPrice,
        itemTotal
      }]
    }
  }),

  removeItem: (productId) => set((state) => ({
    items: state.items.filter(item => item.product._id !== productId)
  })),

  updateQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) {
      return {
        items: state.items.filter(item => item.product._id !== productId)
      }
    }
    
    return {
      items: state.items.map(item => {
        if (item.product._id === productId) {
          const itemPrice = item.itemPrice || item.product.price
          return { 
            ...item, 
            quantity,
            itemTotal: itemPrice * quantity
          }
        }
        return item
      })
    }
  }),

  updateCustomization: (productId, notes) => set((state) => ({
    items: state.items.map(item =>
      item.product._id === productId
        ? { ...item, customizationNotes: notes }
        : item
    )
  })),

  updateItem: (productId, updates) => set((state) => ({
    items: state.items.map(item => {
      if (item.product._id === productId) {
        // Recalculate prices if options or quantity changed
        if (updates.selectedOptions !== undefined || updates.quantity !== undefined) {
          const basePrice = item.product.price
          const selectedOptions = updates.selectedOptions !== undefined ? updates.selectedOptions : item.selectedOptions
          const optionsTotal = (selectedOptions || []).reduce((sum, group) => {
            return sum + group.values.reduce((valSum, val) => valSum + (val.priceModifier || 0), 0)
          }, 0)
          const itemPrice = basePrice + optionsTotal
          const quantity = updates.quantity !== undefined ? updates.quantity : item.quantity
          const itemTotal = itemPrice * quantity
          
          return {
            ...item,
            ...updates,
            basePrice,
            optionsTotal,
            itemPrice,
            itemTotal
          }
        }
        return { ...item, ...updates }
      }
      return item
    })
  })),

  setCustomerName: (name) => set({ customerName: name }),

  setTableNumber: (number) => set({ tableNumber: number }),

  setOrderType: (type) => set({ orderType: type }),

  getSubtotal: () => {
    const { items } = get()
    return items.reduce((sum, item) => {
      // Use itemTotal if available (for items with options), otherwise calculate from product price
      if (item.itemTotal !== undefined) {
        return sum + item.itemTotal
      }
      // Fallback for legacy items without itemTotal
      const basePrice = item.product.price * item.quantity
      const optionsPrice = (item.selectedOptions || []).reduce((optSum, group) => {
        return optSum + group.values.reduce((valSum, val) => valSum + (val.priceModifier || 0), 0)
      }, 0) * item.quantity
      return sum + basePrice + optionsPrice
    }, 0)
  },

  getTax: (taxRate = 7, taxIncludedInPrice = false) => {
    const subtotal = get().getSubtotal()
    if (taxIncludedInPrice) {
      // Tax is included in price, calculate backwards
      // If price = 107 and tax = 7%, then base = 107 / 1.07 = 100, tax = 7
      return subtotal - (subtotal / (1 + taxRate / 100))
    } else {
      // Tax is added on top
      return subtotal * (taxRate / 100)
    }
  },

  getTotal: (taxRate = 7, taxIncludedInPrice = false) => {
    const subtotal = get().getSubtotal()
    if (taxIncludedInPrice) {
      // Price already includes tax
      return subtotal
    } else {
      // Add tax on top
      const tax = get().getTax(taxRate, taxIncludedInPrice)
      return subtotal + tax
    }
  },

  getBasePrice: (taxRate = 7, taxIncludedInPrice = false) => {
    const subtotal = get().getSubtotal()
    if (taxIncludedInPrice) {
      // Calculate base price without tax
      return subtotal / (1 + taxRate / 100)
    } else {
      // Subtotal is already the base price
      return subtotal
    }
  },

  clearCart: () => set({
    items: [],
    customerName: '',
    tableNumber: '',
    orderType: 'Dine-In'
  }),
    }),
    {
      name: 'cart-storage', // localStorage key
      partialize: (state) => ({
        items: state.items,
        customerName: state.customerName,
        tableNumber: state.tableNumber,
        orderType: state.orderType,
      }),
    }
  )
)

export default useCartStore
