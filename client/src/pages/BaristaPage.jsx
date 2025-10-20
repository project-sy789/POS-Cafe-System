import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import OrderQueue from '../components/barista/OrderQueue'
import { initializeSocket, joinRoleRoom } from '../services/socket'
import { Button } from '../components/ui/button'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const BaristaPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  useEffect(() => {
    // Initialize Socket.IO connection with barista role
    if (user) {
      const socket = initializeSocket()
      if (socket) {
        joinRoleRoom('barista')
      }
    }

    // Cleanup on unmount
    return () => {
      // Socket cleanup is handled by the socket service
    }
  }, [user])

  const handleLogout = () => {
    logout()
    toast.success('ออกจากระบบสำเร็จ')
    navigate('/login')
  }

  return (
    <div 
      className="min-h-screen p-3 md:p-6 lg:p-8"
      style={{ backgroundColor: 'var(--theme-bg-secondary)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div 
          className="mb-4 md:mb-6 flex items-center justify-between p-4 md:p-6"
          style={{
            backgroundColor: 'var(--theme-bg-primary)',
            borderWidth: '1px',
            borderColor: 'var(--theme-border)',
            borderRadius: 'var(--theme-radius-md)',
            boxShadow: 'var(--theme-shadow-sm)'
          }}
        >
          <div>
            <h1 
              className="text-2xl md:text-3xl lg:text-4xl font-bold"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              สถานีบาริสต้า
            </h1>
            <p 
              className="text-sm md:text-base mt-1 md:mt-2"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              จัดการและเตรียมออเดอร์ของลูกค้า
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Navigation Buttons */}
            {user?.role === 'Manager' && (
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="flex items-center gap-2 min-h-[44px]"
              >
                <span className="text-lg">📊</span>
                <span className="hidden sm:inline">แดชบอร์ด</span>
              </Button>
            )}
            <Button
              onClick={() => navigate('/pos')}
              variant="outline"
              className="flex items-center gap-2 min-h-[44px]"
            >
              <span className="text-lg">🛒</span>
              <span className="hidden sm:inline">หน้าร้าน</span>
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
        
        <OrderQueue />
      </div>
    </div>
  )
}

export default BaristaPage
