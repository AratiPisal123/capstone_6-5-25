import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082/api'

class PharmaService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Authentication Services
  async login(credentials) {
    const response = await this.api.post('/auth/login', credentials)
    return response.data
  }

  async register(userData) {
    const response = await this.api.post('/auth/register', userData)
    return response.data
  }

  async logout() {
    await this.api.post('/auth/logout')
  }

  async refreshToken() {
    const response = await this.api.post('/auth/refresh')
    return response.data
  }

  // User Services
  async getCurrentUser() {
    const response = await this.api.get('/users/me')
    return response.data
  }

  async updateProfile(userData) {
    const response = await this.api.put('/users/profile', userData)
    return response.data
  }

  async changePassword(passwordData) {
    const response = await this.api.put('/users/password', passwordData)
    return response.data
  }

  async getUserAddresses() {
    const response = await this.api.get('/users/addresses')
    return response.data
  }

  async addAddress(addressData) {
    const response = await this.api.post('/users/addresses', addressData)
    return response.data
  }

  async updateAddress(addressId, addressData) {
    const response = await this.api.put(`/users/addresses/${addressId}`, addressData)
    return response.data
  }

  async deleteAddress(addressId) {
    await this.api.delete(`/users/addresses/${addressId}`)
  }

  // Product Services
  async getProducts(params = {}) {
    const response = await this.api.get('/products', { params })
    return response.data
  }

  async getProduct(productId) {
    const response = await this.api.get(`/products/${productId}`)
    return response.data
  }

  async searchProducts(keyword, params = {}) {
    const response = await this.api.get('/products/search', {
      params: { keyword, ...params }
    })
    return response.data
  }

  async getProductsByCategory(categoryId, params = {}) {
    const response = await this.api.get(`/products/category/${categoryId}`, { params })
    return response.data
  }

  async getProductsByBrand(brandId, params = {}) {
    const response = await this.api.get(`/products/brand/${brandId}`, { params })
    return response.data
  }

  async getFeaturedProducts() {
    const response = await this.api.get('/products/featured')
    return response.data
  }

  async getNewArrivals() {
    const response = await this.api.get('/products/new')
    return response.data
  }

  async getBestSellers() {
    const response = await this.api.get('/products/bestsellers')
    return response.data
  }

  // Category Services
  async getCategories() {
    const response = await this.api.get('/categories')
    return response.data
  }

  async getCategory(categoryId) {
    const response = await this.api.get(`/categories/${categoryId}`)
    return response.data
  }

  // Brand Services
  async getBrands() {
    const response = await this.api.get('/brands')
    return response.data
  }

  async getBrand(brandId) {
    const response = await this.api.get(`/brands/${brandId}`)
    return response.data
  }

  // Order Services
  async createOrder(orderData) {
    const response = await this.api.post('/orders', orderData)
    return response.data
  }

  async getOrders(params = {}) {
    const response = await this.api.get('/orders', { params })
    return response.data
  }

  async getOrder(orderId) {
    const response = await this.api.get(`/orders/${orderId}`)
    return response.data
  }

  async updateOrderStatus(orderId, status) {
    const response = await this.api.put(`/orders/${orderId}/status`, { status })
    return response.data
  }

  async cancelOrder(orderId) {
    const response = await this.api.put(`/orders/${orderId}/cancel`)
    return response.data
  }

  // Cart Services
  async getCart() {
    const response = await this.api.get('/cart')
    return response.data
  }

  async addToCart(productId, quantity = 1) {
    const response = await this.api.post('/cart/items', { productId, quantity })
    return response.data
  }

  async updateCartItem(itemId, quantity) {
    const response = await this.api.put(`/cart/items/${itemId}`, { quantity })
    return response.data
  }

  async removeFromCart(itemId) {
    await this.api.delete(`/cart/items/${itemId}`)
  }

  async clearCart() {
    await this.api.delete('/cart')
  }

  // Review Services
  async getProductReviews(productId, params = {}) {
    const response = await this.api.get(`/products/${productId}/reviews`, { params })
    return response.data
  }

  async addReview(productId, reviewData) {
    const response = await this.api.post(`/products/${productId}/reviews`, reviewData)
    return response.data
  }

  async updateReview(reviewId, reviewData) {
    const response = await this.api.put(`/reviews/${reviewId}`, reviewData)
    return response.data
  }

  async deleteReview(reviewId) {
    await this.api.delete(`/reviews/${reviewId}`)
  }

  // Prescription Services
  async uploadPrescription(fileData) {
    const formData = new FormData()
    formData.append('file', fileData.file)
    formData.append('orderId', fileData.orderId)
    
    const response = await this.api.post('/prescriptions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async getPrescriptions() {
    const response = await this.api.get('/prescriptions')
    return response.data
  }

  async getPrescription(prescriptionId) {
    const response = await this.api.get(`/prescriptions/${prescriptionId}`)
    return response.data
  }

  // Wishlist Services
  async getWishlist() {
    const response = await this.api.get('/wishlist')
    return response.data
  }

  async addToWishlist(productId) {
    const response = await this.api.post('/wishlist', { productId })
    return response.data
  }

  async removeFromWishlist(productId) {
    await this.api.delete(`/wishlist/${productId}`)
  }

  // Notification Services
  async getNotifications() {
    const response = await this.api.get('/notifications')
    return response.data
  }

  async markNotificationAsRead(notificationId) {
    const response = await this.api.put(`/notifications/${notificationId}/read`)
    return response.data
  }

  async markAllNotificationsAsRead() {
    const response = await this.api.put('/notifications/read-all')
    return response.data
  }

  // Email Services
  async verifyEmail(token) {
    const response = await this.api.post('/auth/verify-email', { token })
    return response.data
  }

  async resendVerificationEmail(email) {
    const response = await this.api.post('/auth/resend-verification', { email })
    return response.data
  }

  async forgotPassword(email) {
    const response = await this.api.post('/auth/forgot-password', { email })
    return response.data
  }

  async resetPassword(token, newPassword) {
    const response = await this.api.post('/auth/reset-password', { token, newPassword })
    return response.data
  }

  // Google OAuth Services
  async authenticateWithGoogle(token) {
    const response = await this.api.post('/auth/google', { token })
    return response.data
  }

  // Utility Methods
  async healthCheck() {
    const response = await this.api.get('/health')
    return response.data
  }

  async getServerTime() {
    const response = await this.api.get('/time')
    return response.data
  }
}

export default new PharmaService()
