import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../utils/api'
import './CheckoutPage.css'

function CheckoutPage() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [prescriptionFile, setPrescriptionFile] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: ''
  })
  const [cardVerified, setCardVerified] = useState(false)
  const [cardVerificationMessage, setCardVerificationMessage] = useState('')
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    type: 'HOME',
    isDefault: false
  })
  const [placingOrder, setPlacingOrder] = useState(false)

  useEffect(() => {
    fetchCheckoutData()
  }, [])

  const fetchCheckoutData = async () => {
    try {
      const [cartResponse, addressesResponse] = await Promise.all([
        apiRequest('/api/cart/items'),
        apiRequest('/api/addresses')
      ])
      
      setCartItems(cartResponse.items || [])
      setAddresses(addressesResponse || [])
      
      // Select default address if available
      const defaultAddr = addressesResponse?.find(addr => addr.isDefault)
      if (defaultAddr) {
        setSelectedAddress(defaultAddr)
      } else if (addressesResponse?.length > 0) {
        setSelectedAddress(addressesResponse[0])
      }
    } catch (error) {
      console.error('Failed to fetch checkout data:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifyCard = async () => {
    // Basic card validation
    const cardNumber = cardDetails.number.replace(/\s/g, '')
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
    const cvvRegex = /^\d{3,4}$/
    
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
      setCardVerificationMessage('Invalid card number')
      setCardVerified(false)
      return
    }
    
    if (!expiryRegex.test(cardDetails.expiry)) {
      setCardVerificationMessage('Invalid expiry date (MM/YY)')
      setCardVerified(false)
      return
    }
    
    if (!cvvRegex.test(cardDetails.cvv)) {
      setCardVerificationMessage('Invalid CVV')
      setCardVerified(false)
      return
    }
    
    // Simulate card verification API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      
      // Mock verification - in real app, this would call a payment gateway
      // Accept cards starting with common digits: 1,2,3,4,5,6,7,8,9
      const isValidCard = /^[1-9]/.test(cardNumber) && cardNumber.length >= 13 && cardNumber.length <= 19
      
      if (isValidCard) {
        setCardVerificationMessage('Card verified successfully!')
        setCardVerified(true)
      } else {
        setCardVerificationMessage('Invalid card number. Please check and try again.')
        setCardVerified(false)
      }
    } catch (error) {
      setCardVerificationMessage('Verification failed. Please try again.')
      setCardVerified(false)
    }
  }

  const handleCardDetailsChange = (field, value) => {
    // Format card number with spaces
    if (field === 'number') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
    }
    
    // Format expiry date
    if (field === 'expiry') {
      value = value.replace(/\D/g, '')
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4)
      }
    }
    
    // Only allow numbers for CVV
    if (field === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4)
    }
    
    setCardDetails(prev => ({ ...prev, [field]: value }))
    
    // Reset verification when details change
    if (cardVerified) {
      setCardVerified(false)
      setCardVerificationMessage('')
    }
  }

  const handleAddAddress = async () => {
    try {
      const address = await apiRequest('/api/addresses', {
        method: 'POST',
        body: JSON.stringify(newAddress)
      })
      setAddresses([...addresses, address])
      setSelectedAddress(address)
      setShowAddAddress(false)
      setNewAddress({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        type: 'HOME',
        isDefault: false
      })
    } catch (error) {
      console.error('Failed to add address:', error)
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

  const calculateShipping = () => {
    return calculateSubtotal() >= 500 ? 0 : 50 // Free shipping on orders ₹500 and above
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping()
  }

  const hasPrescriptionItems = cartItems.some(item => item.product?.prescriptionRequired)

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address')
      return
    }

    if (hasPrescriptionItems && !prescriptionFile) {
      alert('Please upload prescription for required items')
      return
    }

    if (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      alert('Please enter complete card details')
      return
    }

    if (paymentMethod === 'card' && !cardVerified) {
      alert('Please verify your card details before placing the order')
      return
    }

    setPlacingOrder(true)
    try {
      const orderData = {
        addressId: selectedAddress.id,
        paymentMethod,
        cardDetails: paymentMethod === 'card' ? cardDetails : null,
        prescriptionFile: prescriptionFile,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPriceSnapshot
        }))
      }

      console.log('Sending order data:', orderData)

      const response = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      })

      console.log('Order response:', response)

      // Redirect to order confirmation with orderId
      const orderId = response.orderId || response.orderNumber
      if (orderId) {
        navigate(`/order-confirmation?orderId=${orderId}`)
      } else {
        console.error('No orderId found in response')
        navigate('/order-confirmation')
      }
    } catch (error) {
      console.error('Failed to place order:', error)
      console.error('Error details:', error.response?.data || error.message)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to place order. Please try again.'
      alert(errorMessage)
    } finally {
      setPlacingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="loading-spinner">Loading checkout...</div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <h2>Checkout</h2>
        <div className="empty-checkout">
          <h3>Your cart is empty</h3>
          <p>Add items to your cart to proceed with checkout</p>
          <button onClick={() => navigate('/catalogue')} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <div className="checkout-wrapper">
        <div className="checkout-form">
          {/* Cart Items Summary */}
          <div className="checkout-product-list">
            <h3>Order Items ({cartItems.length})</h3>
            {cartItems.map((item) => (
              <div key={item.id} className="checkout-product">
                <div className="product-img">
                  {item.product?.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} />
                  ) : (
                    <div className="image-placeholder">💊</div>
                  )}
                </div>
                <div className="product-info">
                  <h4>{item.product?.name || 'Product'}</h4>
                  <p>Quantity: {item.quantity}</p>
                  {item.product?.prescriptionRequired && (
                    <p className="rx-note">📋 Prescription required</p>
                  )}
                </div>
                <p className="product-amount">
                  ₹{((item.totalPrice || (item.unitPriceSnapshot * item.quantity) || 0)).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Delivery Address */}
          <div className="delivery-section">
            <h3>Delivery Address</h3>
            {addresses.length > 0 ? (
              <div className="address-list">
                {addresses.map((addr) => (
                  <label key={addr.id} className="address-option">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?.id === addr.id}
                      onChange={() => setSelectedAddress(addr)}
                    />
                    <div className="address-details">
                      <p className="address-name">{addr.fullName}</p>
                      <p className="address-text">
                        {addr.addressLine1}
                        {addr.addressLine2 && `, ${addr.addressLine2}`}
                      </p>
                      <p className="address-city">
                        {addr.city}, {addr.state} {addr.zipCode}
                      </p>
                      <p className="address-phone">📞 {addr.phone}</p>
                      {addr.isDefault && <span className="default-badge">Default</span>}
                    </div>
                  </label>
                ))}
                <button 
                  className="add-address-btn"
                  onClick={() => setShowAddAddress(true)}
                >
                  + Add New Address
                </button>
              </div>
            ) : (
              <div className="no-address">
                <p>No saved addresses</p>
                <button 
                  className="add-address-btn"
                  onClick={() => setShowAddAddress(true)}
                >
                  + Add Address
                </button>
              </div>
            )}
          </div>

          {/* Add Address Form */}
          {showAddAddress && (
            <div className="add-address-form">
              <h4>Add New Address</h4>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={newAddress.addressLine1}
                  onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (Optional)"
                  value={newAddress.addressLine2}
                  onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={newAddress.zipCode}
                  onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                  required
                />
                <select
                  value={newAddress.type}
                  onChange={(e) => setNewAddress({...newAddress, type: e.target.value})}
                >
                  <option value="HOME">Home</option>
                  <option value="WORK">Work</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="form-actions">
                <button onClick={handleAddAddress} className="save-address-btn">
                  Save Address
                </button>
                <button onClick={() => setShowAddAddress(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Prescription Upload */}
          {hasPrescriptionItems && (
            <div className="prescription-section">
              <h3>Prescription Upload</h3>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="checkout-prescription"
                  accept="image/*,.pdf"
                  onChange={(e) => setPrescriptionFile(e.target.files[0])}
                  className="file-input"
                />
                <label htmlFor="checkout-prescription" className="file-input-btn">
                  Choose prescription file
                  <span>{prescriptionFile ? prescriptionFile.name : 'No file chosen'}</span>
                </label>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="payment-section">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Credit/Debit Card
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="netbanking"
                  checked={paymentMethod === 'netbanking'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Net Banking
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Cash on Delivery
              </label>
            </div>

            {paymentMethod === 'card' && (
              <div className="card-details">
                <input
                  type="text"
                  placeholder="Card number"
                  value={cardDetails.number}
                  onChange={(e) => handleCardDetailsChange('number', e.target.value)}
                  className="card-input"
                  maxLength={19}
                />
                <div className="card-row">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => handleCardDetailsChange('expiry', e.target.value)}
                    className="card-input-small"
                    maxLength={5}
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={cardDetails.cvv}
                    onChange={(e) => handleCardDetailsChange('cvv', e.target.value)}
                    className="card-input-small"
                    maxLength={4}
                  />
                </div>
                
                {/* Verification Section */}
                <div className="card-verification">
                  <button
                    type="button"
                    onClick={verifyCard}
                    disabled={!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv}
                    className="verify-card-btn"
                  >
                    Verify Card
                  </button>
                  
                  {cardVerificationMessage && (
                    <div className={`verification-message ${cardVerified ? 'success' : 'error'}`}>
                      {cardVerificationMessage}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="checkout-actions">
            <button 
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={placingOrder}
            >
              {placingOrder ? 'Placing Order...' : 'Place Order'}
            </button>
            <button 
              className="cancel-checkout-btn"
              onClick={() => navigate('/shopping-cart')}
            >
              Back to Cart
            </button>
          </div>
        </div>

        <aside className="order-summary-sidebar">
          <h3>Order Summary</h3>
          <p className="summary-item">
            Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
            <span>₹{calculateSubtotal().toFixed(2)}</span>
          </p>
          <p className="summary-item">
            Tax (5%)
            <span>₹{calculateTax().toFixed(2)}</span>
          </p>
          <p className="summary-item">
            Shipping
            <span>{calculateShipping() === 0 ? 'FREE' : `₹${calculateShipping().toFixed(2)}`}</span>
          </p>
          {calculateShipping() > 0 && (
            <p className="shipping-note">Free shipping on orders ₹500 and above</p>
          )}
          <h3 className="summary-total">
            Total
            <span>₹{calculateTotal().toFixed(2)}</span>
          </h3>

          <div className="promo-code">
            <h4>Enter promo code</h4>
            <div className="promo-input-group">
              <input type="text" placeholder="Enter promo code" />
              <button>Apply</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CheckoutPage
