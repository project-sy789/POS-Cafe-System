import { useEffect, useState } from 'react'
import { getProducts } from '../../services/productService'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import CustomizationModal from './CustomizationModal'
import toast from 'react-hot-toast'
import { socket } from '../../services/socket'

const MenuGrid = ({ categoryId, onAddToCart, featuredProducts = [] }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false)

  useEffect(() => {
    // Check if selectedCategoryId is 'featured'
    if (categoryId === 'featured') {
      // Use featuredProducts from props
      setProducts(featuredProducts)
      setLoading(false)
    } else {
      // Otherwise, fetch products by category as normal
      fetchProducts()
    }
  }, [categoryId, featuredProducts])

  // Listen for real-time stock updates
  useEffect(() => {
    const handleStockChange = () => {
      // Refetch products when stock changes
      if (categoryId !== 'featured') {
        fetchProducts()
      }
    }

    socket.on('product_stock_changed', handleStockChange)

    return () => {
      socket.off('product_stock_changed', handleStockChange)
    }
  }, [categoryId])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // If categoryId is null, fetch all products (don't pass categoryId)
      const data = categoryId ? await getProducts(categoryId) : await getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleProductClick = (product) => {
    if (!product.isAvailable || product.stockCount <= 0) {
      toast.error('This item is out of stock')
      return
    }

    // Check if product has options
    if (product.options && product.options.length > 0) {
      // Open customization modal
      setSelectedProduct(product)
      setIsCustomizationModalOpen(true)
    } else {
      // Add directly to cart for products without options
      onAddToCart(product)
      toast.success(`${product.name} added to cart`)
    }
  }

  const handleCustomizationConfirm = (customizationData) => {
    if (!selectedProduct) return

    // Add product with customization to cart
    onAddToCart(selectedProduct, customizationData.quantity, customizationData.selectedOptions)
    toast.success(`${selectedProduct.name} added to cart`)
    
    // Close modal
    setIsCustomizationModalOpen(false)
    setSelectedProduct(null)
  }

  const handleCustomizationClose = () => {
    setIsCustomizationModalOpen(false)
    setSelectedProduct(null)
  }

  // Remove this check - allow showing all products when categoryId is null
  // if (!categoryId) {
  //   return (
  //     <div className="flex items-center justify-center h-96">
  //       <div className="text-gray-500 text-lg">Select a category to view products</div>
  //     </div>
  //   )
  // }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading products...</div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">No products in this category</div>
      </div>
    )
  }

  return (
    <>
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {products.map((product) => {
        const isOutOfStock = !product.isAvailable || product.stockCount <= 0
        
        return (
          <Card
            key={product._id}
            style={{
              backgroundColor: 'var(--theme-bg-primary)',
              borderColor: 'var(--theme-border)',
              boxShadow: 'var(--theme-shadow-sm)',
              borderRadius: 'var(--theme-radius-md)',
            }}
            className={`overflow-hidden flex flex-col border ${
              isOutOfStock ? 'opacity-60' : 'hover:shadow-md transition-shadow'
            }`}
          >
            <div className="relative">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{ borderRadius: 'var(--theme-radius-sm) var(--theme-radius-sm) 0 0' }}
                  className="w-full h-32 md:h-40 lg:h-48 object-cover"
                />
              ) : (
                <div 
                  style={{ 
                    backgroundColor: 'var(--theme-bg-secondary)',
                    borderRadius: 'var(--theme-radius-sm) var(--theme-radius-sm) 0 0'
                  }}
                  className="w-full h-32 md:h-40 lg:h-48 flex items-center justify-center"
                >
                  <span className="text-4xl md:text-5xl">🍽️</span>
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold text-sm md:text-base">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 md:p-4 flex flex-col h-full">
              {/* Product Name - 2 lines */}
              <h3 
                style={{ color: 'var(--theme-text-primary)' }}
                className="font-semibold text-sm md:text-base lg:text-lg mb-1 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]"
              >
                {product.name}
              </h3>
              
              {/* Description */}
              {product.description && (
                <p 
                  style={{ color: 'var(--theme-text-secondary)' }}
                  className="text-xs md:text-sm mb-2 line-clamp-2"
                >
                  {product.description}
                </p>
              )}
              
              {/* Spacer to push price and button to bottom */}
              <div className="flex-grow" />
              
              {/* Low Stock Warning */}
              {product.stockCount > 0 && product.stockCount <= product.lowStockThreshold && (
                <p className="text-xs text-orange-500 mb-2">
                  เหลือ {product.stockCount} ชิ้น
                </p>
              )}
              
              {/* Price */}
              <div className="mb-2">
                <span 
                  style={{ color: 'var(--theme-bg-accent)' }}
                  className="text-lg md:text-xl lg:text-2xl font-bold"
                >
                  ฿{product.price.toFixed(2)}
                </span>
              </div>
              
              {/* Button - Full Width */}
              <Button
                onClick={() => handleProductClick(product)}
                disabled={isOutOfStock}
                size="default"
                className={`w-full min-h-[44px] touch-manipulation text-xs md:text-sm font-semibold ${
                  isOutOfStock ? 'cursor-not-allowed' : ''
                }`}
              >
                {product.options && product.options.length > 0 ? (
                  <span className="flex items-center justify-center gap-1 md:gap-2">
                    <span className="text-base md:text-lg">🎨</span>
                    <span className="whitespace-nowrap">ปรับแต่ง</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1 md:gap-2">
                    <span className="text-base md:text-lg">➕</span>
                    <span className="whitespace-nowrap">เพิ่ม</span>
                  </span>
                )}
              </Button>
            </div>
          </Card>
        )
      })}
    </div>

    {/* Customization Modal */}
    <CustomizationModal
      product={selectedProduct}
      isOpen={isCustomizationModalOpen}
      onClose={handleCustomizationClose}
      onConfirm={handleCustomizationConfirm}
    />
    </>
  )
}

export default MenuGrid
