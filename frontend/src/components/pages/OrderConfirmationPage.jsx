import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../utils/api'
import './OrderConfirmationPage.css'

function OrderConfirmationPage() {
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orderId, setOrderId] = useState(null)

  const parseAddress = (addressString, phoneNumber) => {
    if (!addressString || typeof addressString !== 'string') {
      return {
        fullName: 'Customer',
        addressLine1: 'Delivery Address',
        city: 'City',
        state: 'State',
        zipCode: '000000',
        phone: phoneNumber || '0000000000'
      }
    }
    
    // Parse address string like "Kanhur Pathar, Ahmednagar, Maharashtra 414303, USA"
    const parts = addressString.split(',').map(part => part.trim())
    
    return {
      fullName: 'Customer', // Could be extracted if needed
      addressLine1: parts[0] || 'Delivery Address',
      city: parts[1] || 'City',
      state: parts[2] || 'State', 
      zipCode: parts[3] || '000000',
      phone: phoneNumber || '0000000000'
    }
  }

  const formatPaymentMethod = (paymentMethod, cardLast4) => {
    if (!paymentMethod) return 'Net Banking'
    
    switch (paymentMethod.toLowerCase()) {
      case 'cod':
      case 'cash on delivery':
        return 'Cash on Delivery'
      case 'netbanking':
      case 'net banking':
        return 'Net Banking'
      case 'card':
        return cardLast4 ? `Card ending in •••• ${cardLast4}` : 'Card'
      default:
        return paymentMethod
    }
  }

  useEffect(() => {
    // Extract order ID from URL or use mock data
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('orderId') || 'ORD-' + Date.now()
    setOrderId(id)
    
    // In a real app, fetch order details from backend
    fetchOrderDetails(id)
  }, [])

  const fetchOrderDetails = async (id) => {
    try {
      // Fetch real order data from backend
      const response = await apiRequest(`/api/orders/${id}`)
      console.log('Order confirmation data:', response)
      
      // Calculate estimated delivery date (7 days from order date)
      const orderDate = new Date(response.createdAt || Date.now())
      const estimatedDelivery = new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      setOrderData({
        orderId: response.orderNumber || id,
        orderDate: orderDate.toLocaleDateString(),
        totalAmount: response.totalAmount || 0,
        paymentMethod: formatPaymentMethod(response.paymentMethod, response.cardLast4),
        cardLast4: response.cardLast4 || null,
        deliveryAddress: parseAddress(response.deliveryAddress, response.deliveryPhone),
        trackingNumber: response.trackingNumber || `EXP${Date.now()}`,
        estimatedDelivery: estimatedDelivery.toLocaleDateString(),
        items: response.items || []
      })
    } catch (error) {
      console.error('Failed to fetch order details:', error)
      // Fallback to mock data if API fails
      const mockOrderData = {
        orderId: id,
        orderDate: new Date().toLocaleDateString(),
        totalAmount: 125.97,
        paymentMethod: 'Net Banking',
        cardLast4: null,
        deliveryAddress: {
          fullName: 'Customer',
          addressLine1: 'Delivery Address',
          city: 'City',
          state: 'State',
          zipCode: '000000',
          phone: '0000000000'
        },
        trackingNumber: `EXP${Date.now()}`,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        items: []
      }
      setOrderData(mockOrderData)
    } finally {
      setLoading(false)
    }
  }

  const handleTrackOrder = () => {
    navigate('/order-tracking')
  }

  const handleDownloadInvoice = async () => {
    try {
      // Generate invoice data
      const invoiceData = {
        orderNumber: orderData.orderId
      }

      // Create invoice on backend
      const response = await apiRequest('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData)
      })

      console.log('Invoice created:', response)

      // Generate invoice content
      const invoiceContent = generateInvoiceContent(response)
      
      // Create blob and download
      const blob = new Blob([invoiceContent], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Invoice_${response.invoiceNumber}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      alert('Invoice downloaded successfully!')
    } catch (error) {
      console.error('Error downloading invoice:', error)
      alert('Failed to download invoice. Please try again.')
    }
  }

  const generateInvoiceContent = (data) => {
    const itemsHtml = data.items.map(item => `
      <tr>
        <td>${item.name || 'Product'}</td>
        <td>${item.quantity}</td>
        <td>₹${(item.unitPrice || 0).toFixed(2)}</td>
        <td>₹${(item.totalPrice || 0).toFixed(2)}</td>
      </tr>
    `).join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${data.orderId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
          .invoice-info { margin: 20px 0; }
          .address-info { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8f9fa; }
          .total { font-weight: bold; text-align: right; }
          .footer { margin-top: 30px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <h2>Order #${data.orderId}</h2>
        </div>
        
        <div class="invoice-info">
          <p><strong>Order Date:</strong> ${data.orderDate}</p>
          <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
          <p><strong>Status:</strong> ${data.status}</p>
        </div>
        
        <div class="address-info">
          <h3>Delivery Address</h3>
          <p>
            ${data.deliveryAddress.fullName}<br>
            ${data.deliveryAddress.addressLine1}<br>
            ${data.deliveryAddress.city}, ${data.deliveryAddress.state} ${data.deliveryAddress.zipCode}<br>
            📞 ${data.deliveryAddress.phone}
          </p>
        </div>
        
        <h3>Order Items</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div class="total">
          <p><strong>Total Amount: ₹${data.totalAmount.toFixed(2)}</strong></p>
        </div>
        
        <div class="address-info">
          <h3>Tracking Information</h3>
          <p><strong>Courier:</strong> Express Delivery</p>
          <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
          <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
        </div>
        
        <div class="footer">
          <p>Thank you for your order! This is a computer-generated invoice.</p>
        </div>
      </body>
      </html>
    `
  }

  const handleCancelOrder = () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      // Cancel order API call
      alert('Order cancellation functionality would be implemented here')
    }
  }

  if (loading) {
    return (
      <div className="order-confirmation-page">
        <div className="loading-spinner">Loading order details...</div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="order-confirmation-page">
        <div className="error-message">Order not found</div>
      </div>
    )
  }

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-header">
        <div className="success-icon">✓</div>
        <h2>Order Placed Successfully!</h2>
        <p className="order-number">Order #{orderData.orderId}</p>
      </div>

      <div className="confirmation-content">
        <div className="order-summary-box">
          <div className="summary-row">
            <h3>Order ID</h3>
            <p>#{orderData.orderId}</p>
          </div>
          <div className="summary-row">
            <h3>Date</h3>
            <p>{orderData.orderDate}</p>
          </div>
          <div className="summary-row">
            <h3>Total Amount</h3>
            <p>₹{orderData.totalAmount.toFixed(2)}</p>
          </div>
          <div className="summary-row">
            <h3>Payment Method</h3>
            <p>{orderData.paymentMethod}</p>
          </div>
          <div className="summary-row">
            <h3>Delivery Address</h3>
            <p>
              {orderData.deliveryAddress.fullName}<br />
              {orderData.deliveryAddress.addressLine1}<br />
              {orderData.deliveryAddress.city}, {orderData.deliveryAddress.state} {orderData.deliveryAddress.zipCode}<br />
              📞 {orderData.deliveryAddress.phone}
            </p>
          </div>
        </div>

        <div className="timeline-section">
          <h3>Order Status</h3>
          <div className="timeline-horizontal">
            <div className="timeline-step completed">
              <div className="step-dot"></div>
              <p>Order Placed</p>
              <span className="step-time">Just now</span>
            </div>
            <div className="timeline-step">
              <div className="step-dot"></div>
              <p>Packed</p>
              <span className="step-time">--</span>
            </div>
            <div className="timeline-step">
              <div className="step-dot"></div>
              <p>Shipped</p>
              <span className="step-time">--</span>
            </div>
            <div className="timeline-step">
              <div className="step-dot"></div>
              <p>Out for delivery</p>
              <span className="step-time">--</span>
            </div>
            <div className="timeline-step">
              <div className="step-dot"></div>
              <p>Delivered</p>
              <span className="step-time">--</span>
            </div>
          </div>
        </div>
      </div>

      <div className="order-products-confirmation">
        <h3>Order Items</h3>
        {orderData.items.map((item) => (
          <div key={item.id} className="confirmation-product-horizontal">
            <div className="product-info-horizontal">
              <h4>{item.name}</h4>
              <p>Quantity: {item.quantity}</p>
              {item.prescriptionRequired && (
                <p className="prescription-note">📋 Prescription uploaded</p>
              )}
            </div>
            <div className="product-price-horizontal">
              <p>₹{item.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="tracking-info">
        <h3>Tracking Information</h3>
        <p><strong>Courier:</strong> Express Delivery</p>
        <p><strong>Tracking Number:</strong> {orderData.trackingNumber}</p>
        <p><strong>Estimated Delivery:</strong> {orderData.estimatedDelivery}</p>
      </div>

      <div className="confirmation-actions">
        <button className="track-order-btn" onClick={handleTrackOrder}>
          Track Order
        </button>
        <button className="download-invoice-btn" onClick={handleDownloadInvoice}>
          Download Invoice
        </button>
        <button className="continue-shopping-btn" onClick={() => navigate('/catalogue')}>
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

export default OrderConfirmationPage
