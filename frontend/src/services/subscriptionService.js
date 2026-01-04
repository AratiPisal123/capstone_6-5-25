import { apiRequest } from '../utils/api'

export const subscriptionService = {
  // Get all subscriptions for the current user
  getSubscriptions: async () => {
    try {
      const response = await apiRequest('/api/subscriptions')
      return response
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
      throw error
    }
  },

  // Create a new subscription
  createSubscription: async (subscriptionData) => {
    try {
      const response = await apiRequest('/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify(subscriptionData)
      })
      return response
    } catch (error) {
      console.error('Failed to create subscription:', error)
      throw error
    }
  },

  // Update subscription
  updateSubscription: async (subscriptionId, updateData) => {
    try {
      const response = await apiRequest(`/api/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })
      return response
    } catch (error) {
      console.error('Failed to update subscription:', error)
      throw error
    }
  },

  // Pause subscription
  pauseSubscription: async (subscriptionId) => {
    try {
      const response = await apiRequest(`/api/subscriptions/${subscriptionId}/pause`, {
        method: 'POST'
      })
      return response
    } catch (error) {
      console.error('Failed to pause subscription:', error)
      throw error
    }
  },

  // Resume subscription
  resumeSubscription: async (subscriptionId) => {
    try {
      const response = await apiRequest(`/api/subscriptions/${subscriptionId}/resume`, {
        method: 'POST'
      })
      return response
    } catch (error) {
      console.error('Failed to resume subscription:', error)
      throw error
    }
  },

  // Skip next delivery
  skipNextDelivery: async (subscriptionId) => {
    try {
      const response = await apiRequest(`/api/subscriptions/${subscriptionId}/skip`, {
        method: 'POST'
      })
      return response
    } catch (error) {
      console.error('Failed to skip next delivery:', error)
      throw error
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId) => {
    try {
      const response = await apiRequest(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST'
      })
      return response
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      throw error
    }
  },

  // Get subscription categories
  getSubscriptionCategories: async () => {
    try {
      const response = await apiRequest('/api/subscriptions/categories')
      return response
    } catch (error) {
      console.error('Failed to fetch subscription categories:', error)
      throw error
    }
  },

  // Add product to subscription
  addProductToSubscription: async (subscriptionId, productData) => {
    try {
      const response = await apiRequest(`/api/subscriptions/${subscriptionId}/products`, {
        method: 'POST',
        body: JSON.stringify(productData)
      })
      return response
    } catch (error) {
      console.error('Failed to add product to subscription:', error)
      throw error
    }
  },

  // Remove product from subscription
  removeProductFromSubscription: async (subscriptionId, productId) => {
    try {
      const response = await apiRequest(`/api/subscriptions/${subscriptionId}/products/${productId}`, {
        method: 'DELETE'
      })
      return response
    } catch (error) {
      console.error('Failed to remove product from subscription:', error)
      throw error
    }
  }
}