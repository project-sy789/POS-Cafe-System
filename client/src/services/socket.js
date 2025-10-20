import { io } from 'socket.io-client'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

let socket = null

/**
 * Initialize Socket.IO connection with JWT authentication
 * @returns {Socket} Socket.IO client instance
 */
export const initializeSocket = () => {
  // If socket already exists (connected or not), return it
  // This prevents multiple socket instances
  if (socket) {
    console.log('Socket already exists, reusing instance')
    return socket
  }

  // Get the token from auth store
  const token = useAuthStore.getState().token

  if (!token) {
    console.warn('No authentication token found. Socket connection not initialized.')
    return null
  }

  // Determine the server URL based on environment
  const serverUrl = import.meta.env.VITE_API_URL || window.location.origin

  // Initialize socket with authentication
  socket = io(serverUrl, {
    auth: {
      token
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling']
  })

  // Track if we've shown initial connection toast
  let hasShownInitialToast = false

  // Connection event handlers
  socket.on('connect', () => {
    console.log('Socket.IO connected:', socket.id)
    // Only show toast on reconnection, not initial connection
    if (hasShownInitialToast) {
      toast.success('เชื่อมต่อสำเร็จ', { duration: 2000, id: 'socket-connect' })
    }
    hasShownInitialToast = true
  })

  socket.on('disconnect', (reason) => {
    console.log('Socket.IO disconnected:', reason)
    
    if (reason === 'io server disconnect') {
      // Server disconnected the socket, try to reconnect manually
      toast.error('เซิร์ฟเวอร์ตัดการเชื่อมต่อ', { id: 'socket-disconnect' })
      socket.connect()
    } else if (reason === 'io client disconnect') {
      // Client disconnected manually, don't show error
      console.log('Client disconnected manually')
    } else if (reason === 'transport close' || reason === 'transport error') {
      // Network issues, don't spam toasts
      console.log('Network connection issue, will auto-reconnect')
    } else {
      // Other disconnection reasons
      toast.error('การเชื่อมต่อขาดหาย กำลังเชื่อมต่อใหม่...', { 
        duration: 3000, 
        id: 'socket-disconnect' 
      })
    }
  })

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error.message)
    
    if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      toast.error('ไม่สามารถยืนยันตัวตนได้ กรุณาเข้าสู่ระบบใหม่', { id: 'socket-auth-error' })
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    // Don't show toast for other connection errors to avoid spam
  })

  socket.on('reconnect', (attemptNumber) => {
    console.log('Socket.IO reconnected after', attemptNumber, 'attempts')
    toast.success('เชื่อมต่อสำเร็จ', { duration: 2000, id: 'socket-reconnect' })
  })

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('Socket.IO reconnection attempt:', attemptNumber)
    // Don't show toast for each attempt to avoid spam
  })

  socket.on('reconnect_error', (error) => {
    console.error('Socket.IO reconnection error:', error.message)
    // Don't show toast to avoid spam
  })

  socket.on('reconnect_failed', () => {
    console.error('Socket.IO reconnection failed after maximum attempts')
    toast.error('ไม่สามารถเชื่อมต่อได้ กรุณารีเฟรชหน้าเว็บ', { 
      duration: 5000, 
      id: 'socket-reconnect-failed' 
    })
  })

  return socket
}

/**
 * Get the current socket instance
 * @returns {Socket|null} Socket.IO client instance or null
 */
export const getSocket = () => {
  return socket
}

/**
 * Disconnect the socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    console.log('Socket.IO disconnected manually')
  }
}

/**
 * Join a role-based room
 * @param {string} role - User role (barista, cashier, manager)
 */
export const joinRoleRoom = (role) => {
  if (socket && socket.connected) {
    socket.emit('join_role', { role: role.toLowerCase() })
    console.log(`Joined role room: ${role}`)
  } else {
    console.warn('Socket not connected. Cannot join role room.')
  }
}

/**
 * Check if socket is connected
 * @returns {boolean} Connection status
 */
export const isSocketConnected = () => {
  return socket && socket.connected
}

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  joinRoleRoom,
  isSocketConnected
}
