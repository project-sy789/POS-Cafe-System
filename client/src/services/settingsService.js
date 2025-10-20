import api from './api'

/**
 * Get system settings
 * @returns {Promise<Object>} Settings object
 */
export const getSettings = async () => {
  const response = await api.get('/settings')
  return response.data
}

/**
 * Update system settings
 * @param {Object} data - Settings data
 * @param {string} data.storeName - Store name
 * @param {string} data.address - Store address
 * @param {number} data.taxRate - Tax rate percentage
 * @param {string} data.promptPayId - PromptPay ID (phone number or National ID/Tax ID)
 * @param {string} data.uiTheme - UI theme ('default' or 'minimal')
 * @returns {Promise<Object>} Updated settings object
 */
export const updateSettings = async (data) => {
  const response = await api.put('/settings', data)
  return response.data
}
