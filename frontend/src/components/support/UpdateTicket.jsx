import { useState, useEffect } from 'react'
import supportService from '../../services/supportService'
import './CreateTicket.css'

function UpdateTicket({ ticket, onTicketUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const categories = [
    { value: 'ORDER', label: '📦 Order Issues', color: '#667eea' },
    { value: 'PAYMENT', label: '💳 Payment Issues', color: '#f39c12' },
    { value: 'DELIVERY', label: '🚚 Delivery Issues', color: '#e74c3c' },
    { value: 'PRODUCT', label: '💊 Product Issues', color: '#17a2b8' },
    { value: 'PRESCRIPTION', label: '📋 Prescription Issues', color: '#8e44ad' },
    { value: 'OTHER', label: '📝 Other Issues', color: '#6c757d' }
  ]

  const priorities = [
    { value: 'LOW', label: '🟢 Low Priority', color: '#28a745' },
    { value: 'MEDIUM', label: '🟡 Medium Priority', color: '#ffc107' },
    { value: 'HIGH', label: '🔴 High Priority', color: '#dc3545' },
    { value: 'URGENT', label: '🟣 Urgent Priority', color: '#6f42c1' }
  ]

  useEffect(() => {
    if (ticket) {
      setFormData({
        subject: ticket.subject || '',
        description: ticket.description || '',
        category: ticket.category || 'OTHER',
        priority: ticket.priority || 'MEDIUM'
      })
    }
  }, [ticket])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Convert string values to match backend enum format
      const ticketData = {
        ...formData,
        category: formData.category,
        priority: formData.priority
      }
      
      const response = await supportService.updateTicket(ticket.ticketId, ticketData)
      console.log('Ticket update response:', response)
      setSuccess(true)
      
      // Notify parent component
      if (onTicketUpdated) {
        onTicketUpdated(response.data || response)
      }

    } catch (err) {
      // Show more specific error message
      let errorMessage = 'Failed to update ticket. Please try again.'
      
      if (err.response) {
        // Server responded with error
        if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error
        } else if (err.response.status === 401) {
          errorMessage = 'Please log in to update a ticket.'
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to update this ticket.'
        } else if (err.response.status === 404) {
          errorMessage = 'Ticket not found.'
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        }
      } else if (err.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection.'
      }
      
      setError(errorMessage)
      console.error('Error updating ticket:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="create-ticket">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h3>Ticket Updated Successfully!</h3>
          <p>Your support ticket has been updated successfully.</p>
          <div className="ticket-details">
            <h4>Updated Ticket Details:</h4>
            <p><strong>Subject:</strong> {formData.subject}</p>
            <p><strong>Category:</strong> {formData.category}</p>
            <p><strong>Priority:</strong> {formData.priority}</p>
          </div>
          <div className="success-actions">
            <button 
              onClick={() => setSuccess(false)}
              className="create-another-btn"
            >
              Update Again
            </button>
            <button 
              onClick={onCancel}
              className="view-tickets-btn"
            >
              Back to Tickets
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-ticket">
      <div className="create-ticket-header">
        <h2>Update Support Ticket</h2>
        <p>Update the details of your support ticket.</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="ticket-form">
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <div className="category-options">
            {categories.map(cat => (
              <label
                key={cat.value}
                className={`category-option ${formData.category === cat.value ? 'selected' : ''}`}
                style={{ borderColor: cat.color }}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={formData.category === cat.value}
                  onChange={handleChange}
                />
                <span>{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject *</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief description of your issue"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide detailed information about your issue"
            rows={6}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority *</label>
          <div className="priority-options">
            {priorities.map(pri => (
              <label
                key={pri.value}
                className={`priority-option ${formData.priority === pri.value ? 'selected' : ''}`}
                style={{ borderColor: pri.color }}
              >
                <input
                  type="radio"
                  name="priority"
                  value={pri.value}
                  checked={formData.priority === pri.value}
                  onChange={handleChange}
                />
                <span>{pri.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UpdateTicket
