import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import useAuthStore from '../store/authStore'

const UnauthorizedPage = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-4">Unauthorized Access</h2>
        <p className="text-gray-600 mb-8">
          You do not have permission to access this page.
        </p>
        <Button onClick={handleLogout}>
          Return to Login
        </Button>
      </div>
    </div>
  )
}

export default UnauthorizedPage
