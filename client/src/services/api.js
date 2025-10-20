import axios from 'axios'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error

    if (!response) {
      toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }

    switch (response.status) {
      case 401:
        // Unauthorized - clear auth and redirect to login
        toast.error('Session expired. Please login again.')
        useAuthStore.getState().logout()
        window.location.href = '/login'
        break

      case 403:
        // Forbidden - user doesn't have permission
        toast.error('You do not have permission to perform this action')
        break

      case 404:
        // Not found
        toast.error(response.data?.message || 'Resource not found')
        break

      case 409:
        // Conflict (e.g., duplicate entry)
        toast.error(response.data?.message || 'A conflict occurred')
        break

      case 422:
        // Validation error
        toast.error(response.data?.message || 'Validation error')
        break

      case 500:
      case 502:
      case 503:
        // Server errors
        toast.error('Server error. Please try again later.')
        break

      default:
        // Other errors
        toast.error(response.data?.message || 'An error occurred')
    }

    return Promise.reject(error)
  }
)

export default api
