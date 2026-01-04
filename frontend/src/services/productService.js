import { apiRequest } from '../utils/api'

// Fetch all products
export const fetchProducts = async () => {
  try {
    const response = await apiRequest('/api/products')
    return response
  } catch (error) {
    console.error('Failed to fetch products:', error)
    throw error
  }
}

// Fetch product by ID
export const fetchProductById = async (productId) => {
  try {
    const response = await apiRequest(`/api/products/${productId}`)
    return response
  } catch (error) {
    console.error('Failed to fetch product:', error)
    throw error
  }
}

// Search products
export const searchProducts = async (query) => {
  try {
    const response = await apiRequest(`/api/products/search?q=${encodeURIComponent(query)}`)
    return response
  } catch (error) {
    console.error('Failed to search products:', error)
    throw error
  }
}

// Get products by category
export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await apiRequest(`/api/products/category/${categoryId}`)
    return response
  } catch (error) {
    console.error('Failed to fetch products by category:', error)
    throw error
  }
}
