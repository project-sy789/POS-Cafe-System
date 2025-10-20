import { useEffect, useState } from 'react'
import { getCategories, getBestSellingProducts } from '../../services/productService'
import { getSettings } from '../../services/settingsService'
import { Card } from '../ui/card'
import toast from 'react-hot-toast'

const CategoryGrid = ({ onSelectCategory, selectedCategoryId, onFeaturedProductsChange }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingBestSellers, setLoadingBestSellers] = useState(false)
  const [featuredSettings, setFeaturedSettings] = useState({
    mode: 'all',
    label: 'ทั้งหมด',
    icon: '🏪'
  })
  const [featuredProducts, setFeaturedProducts] = useState([])

  useEffect(() => {
    fetchSettings()
    fetchCategories()
  }, [])

  const fetchSettings = async () => {
    try {
      const settings = await getSettings()
      if (settings.featuredCategory) {
        setFeaturedSettings(settings.featuredCategory)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      // Use defaults if settings not found
    }
  }

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleFeaturedClick = async () => {
    if (featuredSettings.mode === 'all') {
      onSelectCategory(null)
    } else {
      // mode is 'featured'
      try {
        setLoadingBestSellers(true)
        const products = await getBestSellingProducts()
        setFeaturedProducts(products)
        if (onFeaturedProductsChange) {
          onFeaturedProductsChange(products)
        }
        onSelectCategory('featured')
      } catch (error) {
        console.error('Failed to load best sellers:', error)
        toast.error('Failed to load best sellers')
        onSelectCategory(null) // Fallback to all products
      } finally {
        setLoadingBestSellers(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">Loading categories...</div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">No categories available</div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Horizontal Scrollable Category Tabs */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 md:gap-3 pb-2 min-w-max">
          {/* Featured Category Button */}
          <button
            onClick={handleFeaturedClick}
            disabled={loadingBestSellers}
            style={{
              backgroundColor: selectedCategoryId === null || selectedCategoryId === 'featured' 
                ? 'var(--theme-bg-accent)' 
                : 'var(--theme-bg-primary)',
              color: selectedCategoryId === null || selectedCategoryId === 'featured'
                ? '#FFFFFF'
                : 'var(--theme-text-primary)',
              borderColor: 'var(--theme-border)',
              boxShadow: selectedCategoryId === null || selectedCategoryId === 'featured'
                ? 'var(--theme-shadow-md)'
                : 'none',
              borderRadius: 'var(--theme-radius-md)',
            }}
            className={`flex-shrink-0 px-4 md:px-6 py-3 md:py-4 font-medium transition-all whitespace-nowrap touch-manipulation border ${
              selectedCategoryId === null || selectedCategoryId === 'featured'
                ? ''
                : 'hover:bg-gray-100'
            } ${loadingBestSellers ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-2">
              {loadingBestSellers ? (
                <>
                  <span className="text-lg animate-spin">⏳</span>
                  <span className="text-sm md:text-base">Loading...</span>
                </>
              ) : (
                <>
                  {featuredSettings.iconUrl ? (
                    <img
                      src={featuredSettings.iconUrl}
                      alt={featuredSettings.label}
                      className="w-6 h-6 md:w-8 md:h-8 object-contain"
                    />
                  ) : (
                    <span className="text-lg">{featuredSettings.icon}</span>
                  )}
                  <span className="text-sm md:text-base">{featuredSettings.label}</span>
                </>
              )}
            </div>
          </button>

          {/* Category Buttons */}
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => onSelectCategory(category._id)}
              style={{
                backgroundColor: selectedCategoryId === category._id
                  ? 'var(--theme-bg-accent)'
                  : 'var(--theme-bg-primary)',
                color: selectedCategoryId === category._id
                  ? '#FFFFFF'
                  : 'var(--theme-text-primary)',
                borderColor: 'var(--theme-border)',
                boxShadow: selectedCategoryId === category._id
                  ? 'var(--theme-shadow-md)'
                  : 'none',
                borderRadius: 'var(--theme-radius-md)',
              }}
              className={`flex-shrink-0 px-4 md:px-6 py-3 md:py-4 font-medium transition-all whitespace-nowrap touch-manipulation border ${
                selectedCategoryId === category._id
                  ? ''
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Use icon if available, otherwise use image, otherwise use default emoji */}
                {category.iconUrl ? (
                  <img
                    src={category.iconUrl}
                    alt={category.name}
                    className="w-6 h-6 md:w-8 md:h-8 object-contain"
                  />
                ) : category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    style={{ borderRadius: 'var(--theme-radius-sm)' }}
                    className="w-6 h-6 md:w-8 md:h-8 object-cover"
                  />
                ) : (
                  <span className="text-base md:text-lg">📁</span>
                )}
                <span className="text-sm md:text-base">{category.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Scroll Indicators (optional) */}
      <div 
        style={{ 
          background: 'linear-gradient(to left, var(--theme-bg-secondary), transparent)' 
        }}
        className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none" 
      />
    </div>
  )
}

export default CategoryGrid
