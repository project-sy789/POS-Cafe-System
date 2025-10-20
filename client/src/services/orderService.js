import api from './api'

/**
 * Create a new order
 * @param {Object} orderData - Order details
 * @returns {Promise} Order response
 */
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData)
  return response.data
}

/**
 * Get orders with optional filters
 * @param {Object} filters - Query filters (status, startDate, endDate, paymentMethod)
 * @returns {Promise} Array of orders
 */
export const getOrders = async (filters = {}) => {
  const params = new URLSearchParams()
  
  if (filters.status) params.append('status', filters.status)
  if (filters.startDate) params.append('startDate', filters.startDate)
  if (filters.endDate) params.append('endDate', filters.endDate)
  if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod)
  
  const response = await api.get(`/orders?${params.toString()}`)
  return response.data
}

/**
 * Get a single order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise} Order details
 */
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`)
  return response.data
}

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise} Updated order
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/orders/${orderId}/status`, { status })
  return response.data
}

/**
 * Get sales report
 * @param {Object} filters - Date range filters
 * @returns {Promise} Sales report data
 */
export const getSalesReport = async (filters = {}) => {
  const params = new URLSearchParams()
  
  if (filters.startDate) params.append('startDate', filters.startDate)
  if (filters.endDate) params.append('endDate', filters.endDate)
  
  const response = await api.get(`/orders/reports/sales?${params.toString()}`)
  return response.data
}

/**
 * Export orders to CSV
 * @param {Object} filters - Date range filters
 * @returns {Promise} CSV file blob
 */
export const exportOrdersCSV = async (filters = {}) => {
  const params = new URLSearchParams()
  
  if (filters.startDate) params.append('startDate', filters.startDate)
  if (filters.endDate) params.append('endDate', filters.endDate)
  
  const response = await api.get(`/orders/reports/export?${params.toString()}`, {
    responseType: 'blob'
  })
  return response.data
}
