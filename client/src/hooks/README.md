# Socket.IO Hooks Documentation

This directory contains custom React hooks for working with Socket.IO real-time communication.

## Available Hooks

### `useSocket(eventName, callback, dependencies)`

A hook for subscribing to a single Socket.IO event.

**Parameters:**
- `eventName` (string): The Socket.IO event to listen for
- `callback` (function): The callback function to execute when event is received
- `dependencies` (array, optional): Dependencies array for the callback

**Returns:**
- `socket`: The Socket.IO client instance
- `emit`: Function to emit events
- `isConnected`: Function to check connection status

**Example:**

```javascript
import useSocket from '../hooks/useSocket'

function BaristaPage() {
  const [orders, setOrders] = useState([])

  // Listen for new orders
  const { emit, isConnected } = useSocket('new_order', (order) => {
    console.log('New order received:', order)
    setOrders(prev => [...prev, order])
  })

  // Emit an event
  const acknowledgeOrder = (orderId) => {
    emit('order_acknowledged', { orderId })
  }

  return (
    <div>
      <p>Connection: {isConnected() ? 'Connected' : 'Disconnected'}</p>
      {/* ... */}
    </div>
  )
}
```

### `useSocketEvents(eventHandlers)`

A hook for subscribing to multiple Socket.IO events at once.

**Parameters:**
- `eventHandlers` (object): Object mapping event names to handler functions

**Returns:**
- `socket`: The Socket.IO client instance

**Example:**

```javascript
import useSocketEvents from '../hooks/useSocketEvents'

function OrderQueue() {
  const [orders, setOrders] = useState([])

  useSocketEvents({
    'new_order': (order) => {
      console.log('New order:', order)
      setOrders(prev => [...prev, order])
    },
    'update_order_status': (data) => {
      console.log('Status updated:', data)
      setOrders(prev => prev.map(order => 
        order.id === data.orderId 
          ? { ...order, status: data.status }
          : order
      ))
    },
    'product_update': (data) => {
      console.log('Product updated:', data)
      // Refresh product list
    }
  })

  return (
    <div>
      {/* ... */}
    </div>
  )
}
```

## Socket Service Functions

### `initializeSocket()`

Initializes the Socket.IO connection with JWT authentication.

**Returns:** Socket.IO client instance or null

**Example:**

```javascript
import { initializeSocket } from '../services/socket'

// Initialize socket when user logs in
const socket = initializeSocket()
```

### `getSocket()`

Gets the current socket instance.

**Returns:** Socket.IO client instance or null

### `disconnectSocket()`

Disconnects the socket connection.

**Example:**

```javascript
import { disconnectSocket } from '../services/socket'

// Disconnect when user logs out
disconnectSocket()
```

### `joinRoleRoom(role)`

Joins a role-based Socket.IO room.

**Parameters:**
- `role` (string): User role (barista, cashier, manager)

**Example:**

```javascript
import { joinRoleRoom } from '../services/socket'

// Join barista room
joinRoleRoom('barista')
```

### `isSocketConnected()`

Checks if the socket is currently connected.

**Returns:** Boolean indicating connection status

## Best Practices

1. **Initialize on Login**: Initialize the socket connection after successful login
2. **Disconnect on Logout**: Always disconnect the socket when user logs out
3. **Join Role Rooms**: Join appropriate role-based rooms after connection
4. **Cleanup**: The hooks automatically handle cleanup on component unmount
5. **Error Handling**: Connection errors are handled automatically with toast notifications

## Complete Example

```javascript
import { useEffect, useState } from 'react'
import { initializeSocket, joinRoleRoom, disconnectSocket } from '../services/socket'
import useSocketEvents from '../hooks/useSocketEvents'
import useAuthStore from '../store/authStore'

function BaristaPage() {
  const [orders, setOrders] = useState([])
  const { user } = useAuthStore()

  // Initialize socket on mount
  useEffect(() => {
    const socket = initializeSocket()
    
    if (socket && user?.role) {
      joinRoleRoom(user.role)
    }

    // Cleanup on unmount
    return () => {
      // Don't disconnect here if socket is shared across app
      // Only disconnect on logout
    }
  }, [user])

  // Listen to multiple events
  useSocketEvents({
    'new_order': (order) => {
      setOrders(prev => [...prev, order])
    },
    'update_order_status': ({ orderId, status }) => {
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ))
    }
  })

  return (
    <div>
      <h1>Order Queue</h1>
      {orders.map(order => (
        <div key={order.id}>{order.orderNumber}</div>
      ))}
    </div>
  )
}
```
