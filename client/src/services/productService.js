import api from './api'

/**
 * Fetch all categories
 * @returns {Promise<Array>} Array of category objects
 */
export const getCategories = async () => {
  const response = await api.get('/categories')
  return response.data
}

/**
 * Fetch products, optionally filtered by category
 * @param {string} categoryId - Optional category ID to filter products
 * @returns {Promise<Array>} Array of product objects
 */
export const getProducts = async (categoryId = null) => {
  const params = categoryId ? { category: categoryId } : {}
  const response = await api.get('/products', { params })
  return response.data
}

/**
 * Fetch a single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Product object
 */
export const getProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`)
  return response.data
}

/**
 * Create a new category
 * @param {Object} data - Category data (name, description)
 * @returns {Promise<Object>} Created category object
 */
export const createCategory = async (data) => {
  const response = await api.post('/categories', data)
  return response.data
}

/**
 * Update an existing category
 * @param {string} categoryId - Category ID
 * @param {Object} data - Updated category data
 * @returns {Promise<Object>} Updated category object
 */
export const updateCategory = async (categoryId, data) => {
  const response = await api.put(`/categories/${categoryId}`, data)
  return response.data
}

/**
 * Delete a category
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteCategory = async (categoryId) => {
  const response = await api.delete(`/categories/${categoryId}`)
  return response.data
}

/**
 * Create a new product
 * @param {FormData} formData - Product data including image file
 * @returns {Promise<Object>} Created product object
 */
export const createProduct = async (formData) => {
  const response = await api.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/**
 * Update an existing product
 * @param {string} productId - Product ID
 * @param {FormData} formData - Updated product data including optional image file
 * @returns {Promise<Object>} Updated product object
 */
export const updateProduct = async (productId, formData) => {
  const response = await api.put(`/products/${productId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/**
 * Delete a product
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`)
  return response.data
}

/**
 * Fetch best-selling products based on sales statistics
 * @param {number} limit - Optional limit for number of products to return (default: 10)
 * @returns {Promise<Array>} Array of product objects with totalSold data, or empty array on failure
 */
export const getBestSellingProducts = async (limit = 10) => {
  try {
    const response = await api.get('/products/best-sellers', {
      params: { limit }
    })
    return response.data.products || []
  } catch (error) {
    console.error('Failed to fetch best-selling products:', error)
    return []
  }
}
