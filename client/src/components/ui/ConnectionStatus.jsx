import { useState, useEffect } from 'react'
import { getSocket, initializeSocket } from '../../services/socket'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

/**
 * ConnectionStatus component displays the Socket.IO connection status
 * Shows connection state and reconnection attempts
 */
const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [reconnectAttempt, setReconnectAttempt] = useState(0)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    // Get or initialize socket
    let socket = getSocket()
    
    if (!socket) {
      socket = initializeSocket()
    }

    if (!socket) {
      return
    }

    // Set initial connection state
    setIsConnected(socket.connected)
    setShowIndicator(!socket.connected)

    // Connection event handlers
    const handleConnect = () => {
      setIsConnected(true)
      setIsReconnecting(false)
      setReconnectAttempt(0)
      
      // Hide indicator after successful connection (after 3 seconds)
      setTimeout(() => {
        setShowIndicator(false)
      }, 3000)
    }

    const handleDisconnect = (reason) => {
      setIsConnected(false)
      
      // Don't show indicator for manual disconnects or network issues
      if (reason === 'io client disconnect' || 
          reason === 'transport close' || 
          reason === 'transport error') {
        // These are temporary, don't show indicator
        return
      }
      
      setShowIndicator(true)
      setIsReconnecting(true)
    }

    const handleConnectError = (error) => {
      // Only show for auth errors
      if (error.message && (error.message.includes('unauthorized') || 
          error.message.includes('authentication'))) {
        setIsConnected(false)
        setShowIndicator(true)
      }
    }

    const handleReconnectAttempt = (attemptNumber) => {
      setIsReconnecting(true)
      setReconnectAttempt(attemptNumber)
      setShowIndicator(true)
    }

    const handleReconnect = () => {
      setIsConnected(true)
      setIsReconnecting(false)
      setReconnectAttempt(0)
      
      // Hide indicator after successful reconnection (after 3 seconds)
      setTimeout(() => {
        setShowIndicator(false)
      }, 3000)
    }

    const handleReconnectFailed = () => {
      setIsReconnecting(false)
      setShowIndicator(true)
    }

    // Register event listeners
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('reconnect_attempt', handleReconnectAttempt)
    socket.on('reconnect', handleReconnect)
    socket.on('reconnect_failed', handleReconnectFailed)

    // Cleanup
    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('reconnect_attempt', handleReconnectAttempt)
      socket.off('reconnect', handleReconnect)
      socket.off('reconnect_failed', handleReconnectFailed)
    }
  }, [])

  // Don't show indicator if connected and not reconnecting
  if (!showIndicator && isConnected && !isReconnecting) {
    return null
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg
          transition-all duration-300 ease-in-out
          ${
            isConnected
              ? 'bg-green-500 text-white'
              : isReconnecting
              ? 'bg-yellow-500 text-white'
              : 'bg-red-500 text-white'
          }
        `}
      >
        {isConnected ? (
          <>
            <Wifi className="w-5 h-5" />
            <span className="text-sm font-medium">Connected</span>
          </>
        ) : isReconnecting ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">
              Reconnecting... (Attempt {reconnectAttempt})
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5" />
            <span className="text-sm font-medium">Disconnected</span>
          </>
        )}
      </div>
    </div>
  )
}

export default ConnectionStatus
