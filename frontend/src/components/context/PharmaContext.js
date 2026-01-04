import React, { createContext, useContext, useReducer, useEffect } from 'react'
import PharmaService from '../services/PharmaService'

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  cart: null,
  wishlist: [],
  products: [],
  categories: [],
  brands: [],
  orders: [],
  notifications: [],
  loading: false,
  error: null
}

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_USER: 'SET_USER',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  LOGOUT: 'LOGOUT',
  SET_CART: 'SET_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  REMOVE_CART_ITEM: 'REMOVE_CART_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_WISHLIST: 'SET_WISHLIST',
  ADD_TO_WISHLIST: 'ADD_TO_WISHLIST',
  REMOVE_FROM_WISHLIST: 'REMOVE_FROM_WISHLIST',
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_BRANDS: 'SET_BRANDS',
  SET_ORDERS: 'SET_ORDERS',
  ADD_ORDER: 'ADD_ORDER',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ'
}

// Reducer
const pharmaReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false }
    
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null }
    
    case actionTypes.SET_USER:
      return { ...state, user: action.payload }
    
    case actionTypes.SET_AUTHENTICATED:
      return { ...state, isAuthenticated: action.payload }
    
    case actionTypes.LOGOUT:
      return {
        ...initialState,
        categories: state.categories,
        brands: state.brands,
        products: state.products
      }
    
    case actionTypes.SET_CART:
      return { ...state, cart: action.payload }
    
    case actionTypes.UPDATE_CART_ITEM:
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.map(item =>
            item.id === action.payload.itemId
              ? { ...item, ...action.payload.updates }
              : item
          )
        }
      }
    
    case actionTypes.REMOVE_CART_ITEM:
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.filter(item => item.id !== action.payload.itemId)
        }
      }
    
    case actionTypes.CLEAR_CART:
      return { ...state, cart: null }
    
    case actionTypes.SET_WISHLIST:
      return { ...state, wishlist: action.payload }
    
    case actionTypes.ADD_TO_WISHLIST:
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload.product]
      }
    
    case actionTypes.REMOVE_FROM_WISHLIST:
      return {
        ...state,
        wishlist: state.wishlist.filter(product => product.id !== action.payload.productId)
      }
    
    case actionTypes.SET_PRODUCTS:
      return { ...state, products: action.payload }
    
    case actionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload }
    
    case actionTypes.SET_BRANDS:
      return { ...state, brands: action.payload }
    
    case actionTypes.SET_ORDERS:
      return { ...state, orders: action.payload }
    
    case actionTypes.ADD_ORDER:
      return { ...state, orders: [action.payload.order, ...state.orders] }
    
    case actionTypes.SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload }
    
    case actionTypes.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.notificationId
            ? { ...notification, read: true }
            : notification
        )
      }
    
    default:
      return state
  }
}

// Create context
const PharmaContext = createContext()

// Provider component
export const PharmaProvider = ({ children }) => {
  const [state, dispatch] = useReducer(pharmaReducer, initialState)

  // Actions
  const actions = {
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    
    clearError: () => dispatch({ type: actionTypes.CLEAR_ERROR }),
    
    // Authentication actions
    login: async (credentials) => {
      try {
        actions.setLoading(true)
        const response = await PharmaService.login(credentials)
        
        if (response.token) {
          localStorage.setItem('token', response.token)
          dispatch({ type: actionTypes.SET_USER, payload: response.user })
          dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: true })
        }
        
        return response
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },
    
    register: async (userData) => {
      try {
        actions.setLoading(true)
        const response = await PharmaService.register(userData)
        return response
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },
    
    logout: async () => {
      try {
        await PharmaService.logout()
        localStorage.removeItem('token')
        dispatch({ type: actionTypes.LOGOUT })
      } catch (error) {
        console.error('Logout error:', error)
        // Still logout locally even if API call fails
        localStorage.removeItem('token')
        dispatch({ type: actionTypes.LOGOUT })
      }
    },
    
    getCurrentUser: async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: false })
          return null
        }
        
        actions.setLoading(true)
        const response = await PharmaService.getCurrentUser()
        
        dispatch({ type: actionTypes.SET_USER, payload: response.data || response })
        dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: true })
        
        return response
      } catch (error) {
        localStorage.removeItem('token')
        dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: false })
        actions.setError(error.message)
        throw error
      }
    },
    
    // Cart actions
    fetchCart: async () => {
      try {
        actions.setLoading(true)
        const response = await PharmaService.getCart()
        dispatch({ type: actionTypes.SET_CART, payload: response.data || response })
        return response
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },
    
    addToCart: async (productId, quantity = 1) => {
      try {
        actions.setLoading(true)
        const response = await PharmaService.addToCart(productId, quantity)
        dispatch({ type: actionTypes.SET_CART, payload: response.data || response })
        return response
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },
    
    updateCartItem: async (itemId, quantity) => {
      try {
        actions.setLoading(true)
        const response = await PharmaService.updateCartItem(itemId, quantity)
        dispatch({ type: actionTypes.SET_CART, payload: response.data || response })
        return response
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },
    
    removeFromCart: async (itemId) => {
      try {
        actions.setLoading(true)
        await PharmaService.removeFromCart(itemId)
        await actions.fetchCart() // Refresh cart
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },
    
    clearCart: async () => {
      try {
        actions.setLoading(true)
        await PharmaService.clearCart()
        dispatch({ type: actionTypes.CLEAR_CART })
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },
    
    // Wishlist actions
    fetchWishlist: async () => {
      try {
        actions.setLoading(true)
        const response = await PharmaService.getWishlist()
        dispatch({ type: actionTypes.SET_WISHLIST, payload: response.data || response.wishlist || [] })
        return response
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },
    
    addToWishlist: async (productId) => {
      try {
        actions.setLoading(true)
        const response = await PharmaService.addToWishlist(productId)
        await actions.fetchWishlist() // Refresh wishlist
        return response
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },
    
    removeFromWishlist: async (productId) => {
      try {
        actions.setLoading(true)
        await PharmaService.removeFromWishlist(productId)
        await actions.fetchWishlist() // Refresh wishlist
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },
    
    // Product actions
    fetchProducts: async (params = {}) => {
      try {
        actions.setLoading(true)
        const response = await PharmaService.getProducts(params)
        dispatch({ type: actionTypes.SET_PRODUCTS, payload: response.data || response.products || [] })
        return response
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },
    
    // Category actions
    fetchCategories: async () => {
      try {
        actions.setLoading(true)
        const response = await PharmaService.getCategories()
        dispatch({ type: actionTypes.SET_CATEGORIES, payload: response.data || response.categories || [] })
        return response
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },
    
    // Brand actions
    fetchBrands: async () => {
      try {
        actions.setLoading(true)
        const response = await PharmaService.getBrands()
        dispatch({ type: actionTypes.SET_BRANDS, payload: response.data || response.brands || [] })
        return response
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },
    
    // Order actions
    fetchOrders: async (params = {}) => {
      try {
        actions.setLoading(true)
        const response = await PharmaService.getOrders(params)
        dispatch({ type: actionTypes.SET_ORDERS, payload: response.data || response.orders || [] })
        return response
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },
    
    createOrder: async (orderData) => {
      try {
        actions.setLoading(true)
        const response = await PharmaService.createOrder(orderData)
        dispatch({ type: actionTypes.ADD_ORDER, payload: { order: response.data || response } })
        await actions.fetchCart() // Clear cart after order
        return response
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },
    
    // Notification actions
    fetchNotifications: async () => {
      try {
        actions.setLoading(true)
        const response = await PharmaService.getNotifications()
        dispatch({ type: actionTypes.SET_NOTIFICATIONS, payload: response.data || response.notifications || [] })
        return response
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    },
    
    markNotificationAsRead: async (notificationId) => {
      try {
        await PharmaService.markNotificationAsRead(notificationId)
        dispatch({ type: actionTypes.MARK_NOTIFICATION_READ, payload: { notificationId } })
      } catch (error) {
        actions.setError(error.message)
        throw error
      }
    }
  }

  // Initialize data on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is authenticated
        await actions.getCurrentUser()
        
        // Load initial data
        await Promise.all([
          actions.fetchCategories(),
          actions.fetchBrands(),
          actions.fetchProducts({ limit: 20 }) // Load featured products
        ])
        
        // Load user-specific data if authenticated
        if (state.isAuthenticated) {
          await Promise.all([
            actions.fetchCart(),
            actions.fetchWishlist(),
            actions.fetchOrders({ limit: 5 }),
            actions.fetchNotifications()
          ])
        }
      } catch (error) {
        console.error('Initialization error:', error)
      }
    }
    
    initializeApp()
  }, [state.isAuthenticated])

  const value = {
    ...state,
    ...actions
  }

  return (
    <PharmaContext.Provider value={value}>
      {children}
    </PharmaContext.Provider>
  )
}

// Custom hook to use the context
export const usePharmaContext = () => {
  const context = useContext(PharmaContext)
  if (!context) {
    throw new Error('usePharmaContext must be used within a PharmaProvider')
  }
  return context
}

export default PharmaContext
