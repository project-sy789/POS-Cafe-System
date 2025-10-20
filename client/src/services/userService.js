import api from './api'

/**
 * Get all users
 * @returns {Promise<Array>} Array of user objects
 */
export const getUsers = async () => {
  const response = await api.get('/users')
  return response.data
}

/**
 * Create a new user
 * @param {Object} data - User data
 * @param {string} data.username - Username
 * @param {string} data.password - Password
 * @param {string} data.role - User role (Cashier, Barista, Manager)
 * @returns {Promise<Object>} Created user object
 */
export const createUser = async (data) => {
  const response = await api.post('/users', data)
  return response.data
}

/**
 * Update an existing user
 * @param {string} id - User ID
 * @param {Object} data - Updated user data
 * @param {string} data.username - Username
 * @param {string} data.password - Password (optional)
 * @param {string} data.role - User role
 * @returns {Promise<Object>} Updated user object
 */
export const updateUser = async (id, data) => {
  const response = await api.put(`/users/${id}`, data)
  return response.data
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise<Object>} Success response
 */
export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`)
  return response.data
}
