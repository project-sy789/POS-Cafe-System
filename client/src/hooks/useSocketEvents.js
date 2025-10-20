import { useEffect, useRef } from 'react'
import { getSocket, initializeSocket } from '../services/socket'

/**
 * Custom hook for subscribing to multiple Socket.IO events
 * @param {Object} eventHandlers - Object mapping event names to handler functions
 * @example
 * useSocketEvents({
 *   'new_order': (order) => console.log('New order:', order),
 *   'update_order_status': (data) => console.log('Status updated:', data)
 * })
 */
const useSocketEvents = (eventHandlers = {}) => {
  const handlersRef = useRef(eventHandlers)
  const socketRef = useRef(null)

  // Update handlers ref when handlers change
  useEffect(() => {
    handlersRef.current = eventHandlers
  }, [eventHandlers])

  useEffect(() => {
    // Get or initialize socket
    let socket = getSocket()
    
    if (!socket) {
      socket = initializeSocket()
    }

    if (!socket) {
      console.warn('Socket not available. Event listeners not registered.')
      return
    }

    socketRef.current = socket

    // Register all event listeners
    const registeredEvents = []

    Object.entries(handlersRef.current).forEach(([eventName, handler]) => {
      if (typeof handler === 'function') {
        const eventHandler = (...args) => {
          const currentHandler = handlersRef.current[eventName]
          if (currentHandler) {
            currentHandler(...args)
          }
        }

        socket.on(eventName, eventHandler)
        registeredEvents.push({ eventName, handler: eventHandler })
        console.log(`Registered listener for event: ${eventName}`)
      }
    })

    // Cleanup function to remove all event listeners
    return () => {
      registeredEvents.forEach(({ eventName, handler }) => {
        socket.off(eventName, handler)
        console.log(`Removed listener for event: ${eventName}`)
      })
    }
  }, []) // Empty dependency array - handlers are managed via ref

  return {
    socket: socketRef.current
  }
}

export default useSocketEvents
