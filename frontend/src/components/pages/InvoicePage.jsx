import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../utils/api'
import './InvoicePage.css'

function InvoicePage() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      const response = await apiRequest('/api/invoices')
      setInvoices(response.invoices || [])
    } catch (error) {
      console.error('Error loading invoices:', error)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async (invoice) => {
    try {
      // Get invoice details (this will increment download count)
      const response = await apiRequest(`/api/invoices/${invoice.invoiceNumber}`)
      
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

      // Refresh invoices to update download count
      loadInvoices()

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

  const handleDeleteInvoice = async (invoiceNumber) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await apiRequest(`/api/invoices/${invoiceNumber}`, {
          method: 'DELETE'
        })
        
        loadInvoices()
        alert('Invoice deleted successfully!')
      } catch (error) {
        console.error('Error deleting invoice:', error)
        alert('Failed to delete invoice. Please try again.')
      }
    }
  }

  const handleClearAllInvoices = async () => {
    if (confirm('Are you sure you want to delete all invoices? This action cannot be undone.')) {
      try {
        await apiRequest('/api/invoices', {
          method: 'DELETE'
        })
        
        setInvoices([])
        alert('All invoices deleted successfully!')
      } catch (error) {
        console.error('Error clearing invoices:', error)
        alert('Failed to clear invoices. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <div className="invoice-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading invoices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="invoice-page">
      <div className="invoice-header">
        <h1>My Invoices</h1>
        <div className="header-actions">
          <button className="back-btn" onClick={() => navigate('/profile')}>
            ← Back to Profile
          </button>
          {invoices.length > 0 && (
            <button className="clear-all-btn" onClick={handleClearAllInvoices}>
              Clear All
            </button>
          )}
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="no-invoices">
          <div className="empty-state">
            <h3>No Invoices Found</h3>
            <p>You haven't downloaded any invoices yet.</p>
            <button className="shop-btn" onClick={() => navigate('/catalogue')}>
              Start Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="invoices-list">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="invoice-card">
              <div className="invoice-info">
                <h3>Invoice #{invoice.invoiceNumber}</h3>
                <p><strong>Order:</strong> {invoice.orderNumber}</p>
                <p><strong>Date:</strong> {new Date(invoice.orderDate).toLocaleDateString()}</p>
                <p><strong>Total:</strong> ₹{invoice.totalAmount.toFixed(2)}</p>
                <p><strong>Payment:</strong> {invoice.paymentMethod}</p>
                <p><strong>Status:</strong> {invoice.status}</p>
                <p><strong>Downloads:</strong> {invoice.downloadCount || 0}</p>
                {invoice.lastDownloaded && (
                  <p><strong>Last Downloaded:</strong> {new Date(invoice.lastDownloaded).toLocaleDateString()}</p>
                )}
              </div>
              <div className="invoice-actions">
                <button 
                  className="download-btn"
                  onClick={() => handleDownloadInvoice(invoice)}
                >
                  Download
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteInvoice(invoice.invoiceNumber)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default InvoicePage
