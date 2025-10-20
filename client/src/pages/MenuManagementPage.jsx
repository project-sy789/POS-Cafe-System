import React, { useState } from 'react'
import { Button } from '../components/ui/button'
import CategoryList from '../components/dashboard/CategoryList'
import ProductList from '../components/dashboard/ProductList'

const MenuManagementPage = () => {
  const [activeSection, setActiveSection] = useState('categories')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">จัดการเมนู</h2>
        <p className="text-gray-600">จัดการหมวดหมู่และสินค้าของคาเฟ่</p>
      </div>

      {/* Section Toggle */}
      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setActiveSection('categories')}
          className={`
            px-4 py-2 font-medium border-b-2 transition-colors
            ${activeSection === 'categories'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
            }
          `}
        >
          หมวดหมู่
        </button>
        <button
          onClick={() => setActiveSection('products')}
          className={`
            px-4 py-2 font-medium border-b-2 transition-colors
            ${activeSection === 'products'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
            }
          `}
        >
          สินค้า
        </button>
      </div>

      {/* Content */}
      <div>
        {activeSection === 'categories' && <CategoryList />}
        {activeSection === 'products' && <ProductList />}
      </div>
    </div>
  )
}

export default MenuManagementPage
