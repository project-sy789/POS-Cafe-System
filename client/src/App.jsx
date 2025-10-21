import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import POSPage from './pages/POSPage'
import BaristaPage from './pages/BaristaPage'
import DashboardPage from './pages/DashboardPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import ConnectionStatus from './components/ui/ConnectionStatus'
import ThemeProvider from './components/ThemeProvider'
import useAuthStore from './store/authStore'
import themeStore from './store/themeStore'
import { getSettings } from './services/settingsService'
import { updateFavicon, updatePageTitle } from './utils/faviconManager'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  // Load theme from localStorage immediately on mount
  useEffect(() => {
    themeStore.getState().loadTheme()
  }, [])

  // Load settings and update favicon and theme
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings()
        if (settings.faviconData || settings.faviconUrl) {
          updateFavicon(settings.faviconUrl, settings.faviconData)
        }
        if (settings.storeName) {
          updatePageTitle(settings.storeName)
        }
        // Sync theme from API settings
        if (settings.uiTheme) {
          themeStore.getState().syncTheme(settings.uiTheme)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }

    if (isAuthenticated) {
      loadSettings()
    }
  }, [isAuthenticated])

  // Get default route based on user role
  const getDefaultRoute = () => {
    if (!user) return '/pos'
    
    switch (user.role) {
      case 'Manager':
        return '/dashboard'
      case 'Cashier':
        return '/pos'
      default:
        return '/pos'
    }
  }

  return (
    <ThemeProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        {/* Connection Status Indicator */}
        {isAuthenticated && <ConnectionStatus />}
        
        <Routes>
        {/* Public route */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          } 
        />

        {/* Protected routes */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={['Cashier', 'Manager']}>
              <POSPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/barista"
          element={
            <ProtectedRoute allowedRoles={['Cashier', 'Manager']}>
              <BaristaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Default redirect based on authentication */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={getDefaultRoute()} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
