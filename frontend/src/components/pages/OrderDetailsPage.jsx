import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../utils/api'
import './OrderDetailsPage.css'

function OrderDetailsPage() {
  const { orderNumber } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetails()
  }, [orderNumber])

  const fetchOrderDetails = async () => {
    try {
      console.log('Fetching order details for:', orderNumber)
      const response = await apiRequest(`/api/orders/${orderNumber}`)
      console.log('Order details response:', response)
      setOrder(response)  // Set response directly, not response.order
      console.log('Order set:', response)
    } catch (error) {
      console.error('Failed to fetch order details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRepeatOrder = async () => {
    try {
      console.log('Repeating order:', order.orderNumber)
      
      // Create order request from existing order
      const orderRequest = {
        items: order.items?.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          prescriptionRequired: item.prescriptionRequired
        })) || [],
        paymentMethod: order.paymentMethod,
        addressId: null // User will need to select address
      }
      
      const response = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderRequest)
      })
      
      console.log('Repeat order response:', response)
      alert('Order repeated successfully! Order ID: ' + response.orderId)
      navigate('/orders')
      
    } catch (error) {
      console.error('Error repeating order:', error)
      alert('Failed to repeat order. Please try again.')
    }
  }

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return
    }
    
    try {
      console.log('Cancelling order:', order.orderNumber)
      
      const response = await apiRequest(`/api/orders/${order.orderNumber}/cancel`, {
        method: 'PUT'
      })
      
      console.log('Cancel order response:', response)
      alert('Order cancelled successfully!')
      
      // Refresh order details
      fetchOrderDetails()
      
    } catch (error) {
      console.error('Error cancelling order:', error)
      alert('Failed to cancel order. Please try again.')
    }
  }

  const handleDownloadInvoice = async () => {
    try {
      const response = await apiRequest('/api/invoices', {
        method: 'POST',
        body: JSON.stringify({ orderNumber: order.orderNumber })
      })

      const invoiceContent = generateInvoiceContent(response)
      
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
        <td>${item.name || item.productName || 'Product'}</td>
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getTimelineStatus = (status) => {
    const statusFlow = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']
    const currentIndex = statusFlow.indexOf(status?.toUpperCase())
    return statusFlow.map((s, index) => ({
      status: s.replace('_', ' '),
      active: index <= currentIndex
    }))
  }

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="loading-spinner">Loading order details...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="order-details-page">
        <div className="error-message">Order not found</div>
      </div>
    )
  }

  // Debug: Show order data
  console.log('Rendering order:', order)
  console.log('Order items:', order.items)
  console.log('Order status:', order.status)

  return (
    <div className="order-details-page">
      <h2>Order #{order.orderNumber} Details</h2>
      
      <div className="order-details-wrapper">
        <div className="order-info-section">
          <h3>Order #{order.orderNumber}</h3>
          <p>{formatDate(order.createdAt)}</p>
          <p>{order.items?.length || 0} items <strong>₹{(order.totalAmount || 0).toFixed(2)}</strong></p>
          
          <h4>Payment method</h4>
          <p>{order.paymentMethod}</p>
          
          <h4>Delivery address</h4>
          <p>{order.deliveryAddress}</p>
        </div>

        <div className="order-timeline-section">
          <div className="timeline">
            {getTimelineStatus(order.status).map((item, index) => (
              <div key={index} className={`timeline-item ${item.active ? 'active' : ''}`}>
                <div className="timeline-dot"></div>
                <p>{item.status}</p>
              </div>
            ))}
          </div>
          <p className="estimated-delivery">Estimated delivery: {order.estimatedDelivery}</p>
        </div>
      </div>

      <div className="order-products">
        {order.items?.map((item, index) => (
          <div key={index} className="product-item">
            <p className="product-name">{item.productName || item.name || 'Product'}</p>
            <p className="product-qty">Quantity: {item.quantity}</p>
            {item.prescriptionRequired && (
              <p className="product-detail">Prescription uploaded</p>
            )}
            <p className="product-price">₹{(item.totalPrice || 0).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="order-actions">
        <button className="action-btn" onClick={handleDownloadInvoice}>Download Invoice</button>
        <button className="action-btn" onClick={handleRepeatOrder}>Repeat order</button>
        <button className="action-btn cancel" onClick={handleCancelOrder}>Cancel order</button>
      </div>

      <div className="order-footer">
        <p>Courier: <a href="#">{order.courier || 'Express Delivery'}</a></p>
        <p>Tracking number: {order.trackingNumber}</p>
      </div>
    </div>
  )
}

export default OrderDetailsPage
