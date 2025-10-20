import { useEffect, useRef, useCallback } from 'react'
import { getSocket, initializeSocket } from '../services/socket'

/**
 * Custom hook for Socket.IO event subscription
 * @param {string} eventName - The Socket.IO event to listen for
 * @param {Function} callback - The callback function to execute when event is received
 * @param {Array} dependencies - Dependencies array for the callback (optional)
 * @returns {Object} Object containing socket instance and helper functions
 */
const useSocket = (eventName, callback, dependencies = []) => {
  const callbackRef = useRef(callback)
  const socketRef = useRef(null)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    // Get or initialize socket
    let socket = getSocket()
    
    if (!socket) {
      socket = initializeSocket()
    }

    if (!socket) {
      console.warn('Socket not available. Event listener not registered.')
      return
    }

    socketRef.current = socket

    // Register event listener if eventName is provided
    if (eventName) {
      const eventHandler = (...args) => {
        if (callbackRef.current) {
          callbackRef.current(...args)
        }
      }

      socket.on(eventName, eventHandler)
      console.log(`Registered listener for event: ${eventName}`)

      // Cleanup function to remove event listener
      return () => {
        socket.off(eventName, eventHandler)
        console.log(`Removed listener for event: ${eventName}`)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName, ...dependencies])

  // Helper function to emit events
  const emit = useCallback((event, data) => {
    const socket = socketRef.current || getSocket()
    
    if (socket && socket.connected) {
      socket.emit(event, data)
      console.log(`Emitted event: ${event}`, data)
    } else {
      console.warn(`Cannot emit event ${event}. Socket not connected.`)
    }
  }, [])

  // Helper function to check connection status
  const isConnected = useCallback(() => {
    const socket = socketRef.current || getSocket()
    return socket && socket.connected
  }, [])

  return {
    socket: socketRef.current,
    emit,
    isConnected
  }
}

export default useSocket
