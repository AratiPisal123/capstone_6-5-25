import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../utils/api'
import './ShoppingCartPage.css'

function ShoppingCartPage() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [prescriptionFile, setPrescriptionFile] = useState(null)
  const [updatingQuantities, setUpdatingQuantities] = useState(new Set())

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setCartItems([])
        setLoading(false)
        return
      }

      const response = await apiRequest('/api/cart/items')
      setCartItems(response.items || [])
    } catch (error) {
      console.error('Failed to fetch cart items:', error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    
    setUpdatingQuantities(prev => new Set(prev).add(itemId))
    try {
      await apiRequest(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: newQuantity })
      })
      
      setCartItems(prev => prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              quantity: newQuantity, 
              totalPrice: (item.unitPriceSnapshot || 0) * newQuantity
            }
          : item
      ))
    } catch (error) {
      console.error('Failed to update quantity:', error)
    } finally {
      setUpdatingQuantities(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const removeItem = async (itemId) => {
    try {
      await apiRequest(`/api/cart/items/${itemId}`, { method: 'DELETE' })
      setCartItems(prev => prev.filter(item => item.id !== itemId))
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPrescriptionFile(file)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.totalPrice || (item.unitPriceSnapshot * item.quantity) || 0
      return sum + price
    }, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.05 // 5% tax
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const hasPrescriptionItems = cartItems.some(item => item.product?.prescriptionRequired)

  if (loading) {
    return (
      <div className="shopping-cart-page">
        <div className="loading-spinner">Loading cart...</div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="shopping-cart-page">
        <h2>Shopping Cart</h2>
        <div className="empty-cart">
          <h3>Your cart is empty</h3>
          <p>Add items to your cart to see them here</p>
          <button onClick={() => navigate('/catalogue')} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="shopping-cart-page">
      <h2>Shopping Cart ({cartItems.length} items)</h2>

      <div className="cart-wrapper">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <button 
                onClick={() => removeItem(item.id)}
                className="remove-btn-top"
                title="Remove item"
              >
                ✕
              </button>
              
              <div className="item-image">
                {item.product?.imageUrl ? (
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name}
                    className="product-image"
                  />
                ) : (
                  <div className="image-placeholder">💊</div>
                )}
              </div>
              
              <div className="item-details">
                <h3>{item.product?.name || 'Product'}</h3>
                <p className="item-stock">
                  {item.product?.inStock !== false ? '• In stock' : '• Out of stock'}
                </p>
                {item.product?.prescriptionRequired && (
                  <p className="prescription-required">📋 Prescription required</p>
                )}
              </div>
              
              <div className="item-price-middle">
                <p className="unit-price">₹{item.unitPriceSnapshot?.toFixed(2) || '0.00'}</p>
                <p className="total-price">₹{((item.totalPrice || (item.unitPriceSnapshot * item.quantity) || 0)).toFixed(2)}</p>
              </div>
              
              <div className="item-qty">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={updatingQuantities.has(item.id) || item.quantity <= 1}
                  className="qty-btn"
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={updatingQuantities.has(item.id)}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order summary</h3>
          
          <div className="summary-line">
            <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
            <span>₹{calculateSubtotal().toFixed(2)}</span>
          </div>
          
          <div className="summary-line">
            <span>Tax (5%)</span>
            <span>₹{calculateTax().toFixed(2)}</span>
          </div>
          
          <div className="summary-total">
            <span>Total</span>
            <span>₹{calculateTotal().toFixed(2)}</span>
          </div>

          {hasPrescriptionItems && (
            <div className="prescription-upload">
              <p className="upload-label">
                Upload prescription <span className="required">*</span>
              </p>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="prescription-file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="prescription-file" className="file-input-btn">
                  Choose file
                  <span className="file-name">
                    {prescriptionFile ? prescriptionFile.name : 'No file chosen'}
                  </span>
                </label>
              </div>
              {prescriptionFile && (
                <div className="file-preview">
                  <span className="file-selected">✓ {prescriptionFile.name}</span>
                  <button 
                    onClick={() => setPrescriptionFile(null)}
                    className="remove-file"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          <button 
            className="checkout-btn"
            disabled={hasPrescriptionItems && !prescriptionFile}
            onClick={() => navigate('/checkout')}
          >
            🛒 Proceed to Checkout
          </button>
          
          <button 
            className="continue-shopping-btn"
            onClick={() => navigate('/catalogue')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShoppingCartPage
