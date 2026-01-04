import { useState, useEffect, useCallback } from 'react'
import PharmaService from '../services/PharmaService'

export const usePharmaService = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (apiCall, ...args) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCall(...args)
      return result
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { execute, loading, error }
}

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const { execute, loading, error } = usePharmaService()

  const fetchProducts = useCallback(async (params = {}) => {
    const mergedParams = { ...initialParams, ...params }
    const response = await execute(PharmaService.getProducts, mergedParams)
    
    setProducts(response.data || response.products || [])
    setPagination(response.pagination || {
      page: mergedParams.page || 1,
      limit: mergedParams.limit || 12,
      total: response.total || 0,
      totalPages: response.totalPages || 0
    })
    
    return response
  }, [execute, initialParams])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    pagination,
    loading,
    error,
    fetchProducts,
    refetch: fetchProducts
  }
}

export const useProduct = (productId) => {
  const [product, setProduct] = useState(null)
  const { execute, loading, error } = usePharmaService()

  const fetchProduct = useCallback(async () => {
    if (!productId) return
    
    const response = await execute(PharmaService.getProduct, productId)
    setProduct(response.data || response)
    return response
  }, [execute, productId])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  return {
    product,
    loading,
    error,
    refetch: fetchProduct
  }
}

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const { execute, loading, error } = usePharmaService()

  const fetchCategories = useCallback(async () => {
    const response = await execute(PharmaService.getCategories)
    setCategories(response.data || response.categories || [])
    return response
  }, [execute])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  }
}

export const useBrands = () => {
  const [brands, setBrands] = useState([])
  const { execute, loading, error } = usePharmaService()

  const fetchBrands = useCallback(async () => {
    const response = await execute(PharmaService.getBrands)
    setBrands(response.data || response.brands || [])
    return response
  }, [execute])

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  return {
    brands,
    loading,
    error,
    refetch: fetchBrands
  }
}

export const useCart = () => {
  const [cart, setCart] = useState(null)
  const { execute, loading, error } = usePharmaService()

  const fetchCart = useCallback(async () => {
    const response = await execute(PharmaService.getCart)
    setCart(response.data || response)
    return response
  }, [execute])

  const addToCart = useCallback(async (productId, quantity = 1) => {
    const response = await execute(PharmaService.addToCart, productId, quantity)
    setCart(response.data || response)
    return response
  }, [execute])

  const updateCartItem = useCallback(async (itemId, quantity) => {
    const response = await execute(PharmaService.updateCartItem, itemId, quantity)
    setCart(response.data || response)
    return response
  }, [execute])

  const removeFromCart = useCallback(async (itemId) => {
    await execute(PharmaService.removeFromCart, itemId)
    await fetchCart() // Refresh cart after removal
  }, [execute, fetchCart])

  const clearCart = useCallback(async () => {
    await execute(PharmaService.clearCart)
    setCart(null)
  }, [execute])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  return {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  }
}

export const useOrders = (params = {}) => {
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const { execute, loading, error } = usePharmaService()

  const fetchOrders = useCallback(async (orderParams = {}) => {
    const mergedParams = { ...params, ...orderParams }
    const response = await execute(PharmaService.getOrders, mergedParams)
    
    setOrders(response.data || response.orders || [])
    setPagination(response.pagination || {
      page: mergedParams.page || 1,
      limit: mergedParams.limit || 10,
      total: response.total || 0,
      totalPages: response.totalPages || 0
    })
    
    return response
  }, [execute, params])

  const createOrder = useCallback(async (orderData) => {
    const response = await execute(PharmaService.createOrder, orderData)
    await fetchOrders() // Refresh orders list
    return response
  }, [execute, fetchOrders])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    orders,
    pagination,
    loading,
    error,
    fetchOrders,
    createOrder
  }
}

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { execute, loading, error } = usePharmaService()

  const login = useCallback(async (credentials) => {
    const response = await execute(PharmaService.login, credentials)
    
    if (response.token) {
      localStorage.setItem('token', response.token)
      setUser(response.user)
      setIsAuthenticated(true)
    }
    
    return response
  }, [execute])

  const register = useCallback(async (userData) => {
    const response = await execute(PharmaService.register, userData)
    return response
  }, [execute])

  const logout = useCallback(async () => {
    await execute(PharmaService.logout)
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
  }, [execute])

  const getCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsAuthenticated(false)
      return null
    }

    try {
      const response = await execute(PharmaService.getCurrentUser)
      setUser(response.data || response)
      setIsAuthenticated(true)
      return response
    } catch (err) {
      localStorage.removeItem('token')
      setUser(null)
      setIsAuthenticated(false)
      throw err
    }
  }, [execute])

  useEffect(() => {
    getCurrentUser()
  }, [getCurrentUser])

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    getCurrentUser
  }
}

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState([])
  const { execute, loading, error } = usePharmaService()

  const fetchWishlist = useCallback(async () => {
    const response = await execute(PharmaService.getWishlist)
    setWishlist(response.data || response.wishlist || [])
    return response
  }, [execute])

  const addToWishlist = useCallback(async (productId) => {
    const response = await execute(PharmaService.addToWishlist, productId)
    await fetchWishlist() // Refresh wishlist
    return response
  }, [execute, fetchWishlist])

  const removeFromWishlist = useCallback(async (productId) => {
    await execute(PharmaService.removeFromWishlist, productId)
    await fetchWishlist() // Refresh wishlist
  }, [execute, fetchWishlist])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  return {
    wishlist,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist
  }
}

export const useReviews = (productId) => {
  const [reviews, setReviews] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const { execute, loading, error } = usePharmaService()

  const fetchReviews = useCallback(async (params = {}) => {
    if (!productId) return
    
    const response = await execute(PharmaService.getProductReviews, productId, params)
    
    setReviews(response.data || response.reviews || [])
    setPagination(response.pagination || {
      page: params.page || 1,
      limit: params.limit || 10,
      total: response.total || 0,
      totalPages: response.totalPages || 0
    })
    
    return response
  }, [execute, productId])

  const addReview = useCallback(async (reviewData) => {
    const response = await execute(PharmaService.addReview, productId, reviewData)
    await fetchReviews() // Refresh reviews
    return response
  }, [execute, productId, fetchReviews])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return {
    reviews,
    pagination,
    loading,
    error,
    fetchReviews,
    addReview
  }
}
