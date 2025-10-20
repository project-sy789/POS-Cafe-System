import api from './api'

/**
 * Login with username and password
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<{token: string, user: {id: string, username: string, role: string}}>}
 */
export const login = async (username, password) => {
  const response = await api.post('/auth/login', {
    username,
    password,
  })
  return response.data
}

/**
 * Verify JWT token validity
 * @returns {Promise<{user: {id: string, username: string, role: string}}>}
 */
export const verifyToken = async () => {
  const response = await api.post('/auth/verify')
  return response.data
}
