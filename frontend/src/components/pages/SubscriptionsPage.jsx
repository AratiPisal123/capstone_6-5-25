import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  fetchSubscriptions, 
  pauseSubscription,
  resumeSubscription,
  skipNextDelivery,
  cancelSubscription
} from '../../redux/slices/subscriptionSlice'
import { fetchProducts } from '../../redux/slices/productSlice'
import { useToast } from '../../contexts/ToastContext'
import { apiRequest } from '../../utils/api'
import './SubscriptionsPage.css'

function SubscriptionsPage() {
  const dispatch = useDispatch()
  const { 
    subscriptions, 
    loading, 
    error
  } = useSelector(state => state.subscriptions)
  
  const { products, loading: productsLoading } = useSelector(state => {
    console.log('Redux state:', state)
    return state.products || { products: [], loading: false, error: null }
  })

  const { success, error: toastError, info } = useToast()

  const [newSubscription, setNewSubscription] = useState({
    productId: '',
    quantity: 1,
    frequency: 'MONTHLY',
    deliveryAddress: '',
    specialInstructions: '',
    nextDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    remainingDeliveries: 12
  })

  useEffect(() => {
    dispatch(fetchSubscriptions())
    dispatch(fetchProducts())
  }, [dispatch])

  const handlePauseSubscription = async (subscriptionId) => {
    try {
      await dispatch(pauseSubscription(subscriptionId)).unwrap()
      success('Subscription paused successfully!')
    } catch (error) {
      toastError('Failed to pause subscription: ' + error)
    }
  }

  const handleResumeSubscription = async (subscriptionId) => {
    try {
      await dispatch(resumeSubscription(subscriptionId)).unwrap()
      success('Subscription resumed successfully!')
    } catch (error) {
      toastError('Failed to resume subscription: ' + error)
    }
  }

  const handleSkipNextDelivery = async (subscriptionId) => {
    try {
      await dispatch(skipNextDelivery(subscriptionId)).unwrap()
      success('Next delivery skipped successfully!')
    } catch (error) {
      toastError('Failed to skip next delivery: ' + error)
    }
  }

  const handleCancelSubscription = async (subscriptionId) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      try {
        await dispatch(cancelSubscription(subscriptionId)).unwrap()
        success('Subscription cancelled successfully!')
      } catch (error) {
        toastError('Failed to cancel subscription: ' + error)
      }
    }
  }

  const handleCreateSubscription = async () => {
    try {
      if (!newSubscription.productId) {
        toastError('Please select a product')
        return
      }

      // Create subscription data
      const subscriptionData = {
        productId: newSubscription.productId,
        quantity: newSubscription.quantity,
        frequency: newSubscription.frequency,
        deliveryAddress: newSubscription.deliveryAddress,
        specialInstructions: newSubscription.specialInstructions,
        nextDeliveryDate: newSubscription.nextDeliveryDate,
        remainingDeliveries: newSubscription.remainingDeliveries
      }
      
      console.log('Creating subscription with data:', subscriptionData)
      
      const response = await apiRequest('/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify(subscriptionData)
      })
      
      console.log('Subscription created:', response)
      success('Subscription created successfully!')
      
      // Reset form
      setNewSubscription({
        productId: '',
        quantity: 1,
        frequency: 'MONTHLY',
        deliveryAddress: '',
        specialInstructions: '',
        nextDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        remainingDeliveries: 12
      })
      
      // Refresh subscriptions to show the new one
      console.log('Refreshing subscriptions after creation...')
      dispatch(fetchSubscriptions())
      
    } catch (error) {
      console.error('Failed to create subscription:', error)
      toastError('Failed to create subscription: ' + error.message)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No date set'
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': '#4CAF50',
      'PAUSED': '#FFC107',
      'CANCELLED': '#F44336',
      'COMPLETED': '#9E9E9E',
      'EXPIRED': '#9E9E9E'
    }
    return colors[status] || '#9E9E9E'
  }

  const getStatusText = (status) => {
    return status.charAt(0) + status.slice(1).toLowerCase()
  }

  if (loading && subscriptions.length === 0) {
    return (
      <div className="subscriptions-page">
        <div className="loading-container">
          <div className="loading-spinner">Loading subscriptions...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="subscriptions-page">
      <div className="subscriptions-header">
        <h2>My Subscriptions</h2>
        <p className="breadcrumb">Home <span>&gt;</span> Subscriptions</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => dispatch(fetchSubscriptions())}>Retry</button>
        </div>
      )}

      <div className="subscriptions-layout">
        {/* Left Column - Active Subscriptions */}
        <div className="active-subscriptions-section">
          <div className="section-header">
            <h3>Active Subscriptions</h3>
            <span className="subscription-count">{subscriptions.length} subscriptions</span>
          </div>

          {subscriptions.length === 0 ? (
            <div className="no-subscriptions">
              <div className="no-subscriptions-icon">📦</div>
              <h4>No active subscriptions</h4>
              <p>You don't have any active subscriptions yet. Create your first subscription to get started!</p>
            </div>
          ) : (
            <div className="subscriptions-list">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="subscription-item">
                  <div className="subscription-left">
                    <div className="product-info">
                      <h4 className="product-name">{subscription.product?.name || 'Product'}</h4>
                      <p className="product-details">
                        {subscription.product?.packSize && <span>{subscription.product.packSize}</span>}
                        {subscription.product?.strength && <span>• {subscription.product.strength}</span>}
                      </p>
                    </div>
                    <div className="subscription-info">
                      <div className="info-row">
                        <span className="label">Quantity:</span>
                        <span className="value">{subscription.quantity}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Frequency:</span>
                        <span className="value">{subscription.frequency}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Next Delivery:</span>
                        <span className="value">{formatDate(subscription.nextDeliveryDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="subscription-right">
                    <div className="price-section">
                      <div className="price">{formatPrice(subscription.unitPrice)}</div>
                      <div className="per-delivery">per delivery</div>
                    </div>
                    <div className="status-section">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(subscription.status) }}
                      >
                        {getStatusText(subscription.status)}
                      </span>
                    </div>
                    <div className="actions-section">
                      {subscription.status === 'ACTIVE' && (
                        <>
                          <button 
                            className="action-btn pause-btn"
                            onClick={() => handlePauseSubscription(subscription.id)}
                            style={{
                              background: '#FF9800',
                              color: 'white',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '6px',
                              minWidth: '80px',
                              display: 'inline-block',
                              textAlign: 'center'
                            }}
                          >
                            Pause
                          </button>
                          <button 
                            className="action-btn skip-btn"
                            onClick={() => handleSkipNextDelivery(subscription.id)}
                            style={{
                              background: '#2196F3',
                              color: 'white',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '6px',
                              minWidth: '80px',
                              display: 'inline-block',
                              textAlign: 'center'
                            }}
                          >
                            Skip
                          </button>
                        </>
                      )}
                      
                      {subscription.status === 'PAUSED' && (
                        <button 
                          className="action-btn resume-btn"
                          onClick={() => handleResumeSubscription(subscription.id)}
                          style={{
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            minWidth: '90px',
                            display: 'inline-block',
                            textAlign: 'center'
                          }}
                        >
                          Resume
                        </button>
                      )}
                      
                      <button 
                        className="action-btn cancel-btn"
                        onClick={() => handleCancelSubscription(subscription.id)}
                        style={{
                          background: '#F44336',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '6px',
                          minWidth: '85px',
                          display: 'inline-block',
                          textAlign: 'center'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Create Subscription */}
        <div className="create-subscription-section">
          <div className="section-header">
            <h3>Create Subscription</h3>
          </div>

          <div className="create-subscription-form">
            <div className="form-group">
              <label>Product</label>
              <select 
                value={newSubscription.productId}
                onChange={(e) => setNewSubscription({...newSubscription, productId: e.target.value})}
                className="form-control"
              >
                <option value="">Select a product</option>
                {products && products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} {product.strength && `(${product.strength})`} {product.packSize && `- ${product.packSize}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input 
                type="number"
                min="1"
                value={newSubscription.quantity}
                onChange={(e) => setNewSubscription({...newSubscription, quantity: parseInt(e.target.value)})}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Frequency</label>
              <select 
                value={newSubscription.frequency}
                onChange={(e) => setNewSubscription({...newSubscription, frequency: e.target.value})}
                className="form-control"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Bi-weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="BIMONTHLY">Bi-monthly</option>
                <option value="QUARTERLY">Quarterly</option>
              </select>
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <textarea 
                value={newSubscription.deliveryAddress}
                onChange={(e) => setNewSubscription({...newSubscription, deliveryAddress: e.target.value})}
                className="form-control"
                placeholder="Enter your delivery address"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Special Instructions</label>
              <textarea 
                value={newSubscription.specialInstructions}
                onChange={(e) => setNewSubscription({...newSubscription, specialInstructions: e.target.value})}
                className="form-control"
                placeholder="Any special instructions for delivery"
                rows="2"
              />
            </div>

            <div className="form-group">
              <label>Next Delivery Date</label>
              <input 
                type="date"
                value={newSubscription.nextDeliveryDate}
                onChange={(e) => setNewSubscription({...newSubscription, nextDeliveryDate: e.target.value})}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Number of Deliveries</label>
              <select 
                value={newSubscription.remainingDeliveries}
                onChange={(e) => setNewSubscription({...newSubscription, remainingDeliveries: parseInt(e.target.value)})}
                className="form-control"
              >
                <option value="3">3 deliveries</option>
                <option value="6">6 deliveries</option>
                <option value="12">12 deliveries</option>
                <option value="">Unlimited</option>
              </select>
            </div>

            <div className="form-actions">
              <button 
                className="btn-cancel"
                onClick={() => setNewSubscription({
                  productId: '',
                  quantity: 1,
                  frequency: 'MONTHLY',
                  deliveryAddress: '',
                  specialInstructions: '',
                  nextDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  remainingDeliveries: 12
                })}
              >
                Cancel
              </button>
              <button 
                className="btn-create"
                onClick={handleCreateSubscription}
                disabled={!newSubscription.productId}
              >
                Create Subscription
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionsPage
