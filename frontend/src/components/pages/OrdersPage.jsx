import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../utils/api'
import './OrdersPage.css'

function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await apiRequest('/api/orders')
      setOrders(response.orders || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrackOrder = (orderNumber) => {
    navigate('/order-tracking')
  }

  const handleDownloadInvoice = async (order) => {
    try {
      // Create invoice on backend
      const response = await apiRequest('/api/invoices', {
        method: 'POST',
        body: JSON.stringify({ orderNumber: order.orderNumber })
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

  const handleViewDetails = (orderNumber) => {
    navigate(`/order-details/${orderNumber}`)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return '#28a745'
      case 'shipped':
        return '#007bff'
      case 'out_for_delivery':
        return '#ffc107'
      case 'confirmed':
        return '#28a745'  // Green for CONFIRMED
      case 'pending':
        return '#ffc107'
      case 'cancelled':
        return '#dc3545'
      default:
        return '#6c757d'
    }
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

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || 
      order.status?.toLowerCase() === statusFilter.toLowerCase()
    const matchesSearch = !searchTerm || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-spinner">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <h2>My Orders</h2>
      
      <div className="orders-controls">
        <select 
          className="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Status: All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input 
          type="text" 
          placeholder="Search Order ID" 
          className="search-order"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>DATE</th>
              <th>ITEMS</th>
              <th>TOTAL AMOUNT</th>
              <th>PAYMENT</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-orders">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="order-id">
                    <strong>{order.orderNumber}</strong>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    {order.prescriptionRequired && (
                      <span className="prescription-badge">📋</span>
                    )}
                  </td>
                  <td className="amount">
                    ₹{(order.totalAmount || 0).toFixed(2)}
                  </td>
                  <td className="payment-method">
                    {order.paymentMethod}
                    {order.cardLast4 && (
                      <span className="card-last4">•••• {order.cardLast4}</span>
                    )}
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="actions">
                    <div className="actions">
                      <button 
                        className="action-btn details-btn"
                        onClick={() => handleViewDetails(order.orderNumber)}
                        title="View Details"
                      >
                        Details
                      </button>
                      <button 
                        className="action-btn track-btn"
                        onClick={() => handleTrackOrder(order.orderNumber)}
                        title="Track Order"
                      >
                        Track
                      </button>
                      <button 
                        className="action-btn invoice-btn"
                        onClick={() => handleDownloadInvoice(order)}
                        title="Download Invoice"
                      >
                        Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && !loading && (
        <div className="empty-orders">
          <h3>No orders found</h3>
          <p>You haven't placed any orders yet.</p>
          <button 
            className="continue-shopping-btn"
            onClick={() => navigate('/catalogue')}
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  )
}

export default OrdersPage
