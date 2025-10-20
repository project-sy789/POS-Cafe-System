import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '../components/ui/button'
import MetricsCards from '../components/dashboard/MetricsCards'
import TopProducts from '../components/dashboard/TopProducts'
import SalesChart from '../components/dashboard/SalesChart'
import MenuManagementPage from './MenuManagementPage'
import InventoryManagement from '../components/dashboard/InventoryManagement'
import SalesReportsPage from './SalesReportsPage'
import StaffManagement from '../components/dashboard/StaffManagement'
import SettingsPage from './SettingsPage'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()

  const tabs = [
    { id: 'overview', label: 'ภาพรวม' },
    { id: 'menu', label: 'จัดการเมนู' },
    { id: 'inventory', label: 'คลังสินค้า' },
    { id: 'reports', label: 'รายงานยอดขาย' },
    { id: 'staff', label: 'จัดการพนักงาน' },
    { id: 'settings', label: 'ตั้งค่า' }
  ]

  const handleLogout = () => {
    logout()
    toast.success('ออกจากระบบสำเร็จ')
    navigate('/login')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-bg-secondary)' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--theme-bg-primary)',
        borderBottom: `1px solid var(--theme-border)`
      }}>
        <div className="px-3 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>แดชบอร์ดผู้จัดการ</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--theme-text-secondary)' }}>ยินดีต้อนรับ, {user?.username}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Quick Navigation Buttons for Manager */}
            <Button
              onClick={() => navigate('/pos')}
              variant="outline"
              className="flex items-center gap-2 min-h-[44px]"
            >
              <span className="text-lg">🛒</span>
              <span className="hidden sm:inline">หน้าร้าน</span>
            </Button>
            <Button
              onClick={() => navigate('/barista')}
              variant="outline"
              className="flex items-center gap-2 min-h-[44px]"
            >
              <span className="text-lg">☕</span>
              <span className="hidden sm:inline">Barista</span>
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </Button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="px-3 md:px-6">
          <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium whitespace-nowrap transition-colors touch-manipulation min-h-[44px]"
                style={{
                  borderBottom: activeTab === tab.id 
                    ? `2px solid var(--theme-bg-accent)` 
                    : '2px solid transparent',
                  color: activeTab === tab.id 
                    ? 'var(--theme-bg-accent)' 
                    : 'var(--theme-text-secondary)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 md:p-6 lg:p-8">
        {activeTab === 'overview' && (
          <div className="space-y-4 md:space-y-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4" style={{ color: 'var(--theme-text-primary)' }}>ภาพรวมแดชบอร์ด</h2>
              <p className="text-sm md:text-base mb-4 md:mb-6" style={{ color: 'var(--theme-text-secondary)' }}>ข้อมูลประสิทธิภาพและสถิติของวันนี้</p>
            </div>
            
            {/* Metrics Cards */}
            <MetricsCards />
            
            {/* Charts and Top Products Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Sales Chart - Takes 2 columns on large screens */}
              <div className="lg:col-span-2">
                <SalesChart />
              </div>
              
              {/* Top Products - Takes 1 column */}
              <div className="lg:col-span-1">
                <TopProducts />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'menu' && <MenuManagementPage />}
        
        {activeTab === 'inventory' && <InventoryManagement />}
        
        {activeTab === 'reports' && <SalesReportsPage />}
        
        {activeTab === 'staff' && <StaffManagement />}
        
        {activeTab === 'settings' && <SettingsPage />}
      </div>
    </div>
  )
}

export default DashboardPage
