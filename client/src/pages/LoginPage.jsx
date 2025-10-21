import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { login } from '../services/authService'
import useAuthStore from '../store/authStore'

const LoginPage = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้'
    }

    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน'
    } else if (formData.password.length < 4) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await login(formData.username, formData.password)
      
      console.log('Login response:', response)
      console.log('User role:', response.user.role)
      
      // Store auth data
      setAuth(response.user, response.token)
      
      toast.success(`ยินดีต้อนรับ, ${response.user.username}!`)

      // Redirect based on user role
      switch (response.user.role) {
        case 'Manager':
          console.log('Redirecting to /dashboard')
          navigate('/dashboard')
          break
        case 'Barista':
          console.log('Redirecting to /barista')
          navigate('/barista')
          break
        case 'Cashier':
          console.log('Redirecting to /pos')
          navigate('/pos')
          break
        default:
          console.log('Default redirect to /pos')
          navigate('/pos')
      }
    } catch (error) {
      // Error handling is done by axios interceptor
      // But we can add specific handling here if needed
      if (error.response?.status === 401) {
        setErrors({
          password: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">☕ Café POS</h1>
          <p className="text-sm md:text-base text-gray-600">เข้าสู่ระบบบัญชีของคุณ</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">เข้าสู่ระบบ</CardTitle>
            <CardDescription className="text-sm md:text-base">
              กรอกข้อมูลเพื่อเข้าใช้งานระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm md:text-base font-medium text-gray-700">
                  ชื่อผู้ใช้
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="กรอกชื่อผู้ใช้"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`min-h-[48px] ${errors.username ? 'border-red-500' : ''}`}
                  autoComplete="username"
                  autoFocus
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm md:text-base font-medium text-gray-700">
                  รหัสผ่าน
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="กรอกรหัสผ่าน"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`min-h-[48px] ${errors.password ? 'border-red-500' : ''}`}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full min-h-[52px] md:min-h-[56px] text-base md:text-lg touch-manipulation"
                disabled={isLoading}
              >
                {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
