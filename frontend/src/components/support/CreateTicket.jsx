import { useState } from 'react'
import supportService from '../../services/supportService'
import './CreateTicket.css'

function CreateTicket({ onTicketCreated }) {
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
    { value: 'ORDER', label: 'Order Issues', icon: '📦' },
    { value: 'PAYMENT', label: 'Payment Problems', icon: '💳' },
    { value: 'DELIVERY', label: 'Delivery Concerns', icon: '🚚' },
    { value: 'PRODUCT', label: 'Product Questions', icon: '💊' },
    { value: 'PRESCRIPTION', label: 'Prescription Help', icon: '📋' },
    { value: 'OTHER', label: 'Other Issues', icon: '📝' }
  ]

  const priorities = [
    { value: 'LOW', label: 'Low', color: '#2ed573' },
    { value: 'MEDIUM', label: 'Medium', color: '#ffa502' },
    { value: 'HIGH', label: 'High', color: '#ff4757' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
        category: formData.category, // Keep as string - backend will handle conversion
        priority: formData.priority  // Keep as string - backend will handle conversion
      }
      
      const response = await supportService.createTicket(ticketData)
      console.log('Ticket creation response:', response)
      setSuccess(true)
      
      // Reset form
      setFormData({
        subject: '',
        description: '',
        category: 'OTHER',
        priority: 'MEDIUM'
      })

      // Notify parent component
      if (onTicketCreated) {
        onTicketCreated(response.data || response)
      }

    } catch (err) {
      // Show more specific error message
      let errorMessage = 'Failed to create ticket. Please try again.'
      
      if (err.response) {
        // Server responded with error
        if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error
        } else if (err.response.status === 401) {
          errorMessage = 'Please log in to create a ticket.'
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to create tickets.'
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        }
      } else if (err.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection.'
      }
      
      setError(errorMessage)
      console.error('Error creating ticket:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="create-ticket">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h3>Ticket Created Successfully!</h3>
          <p>Your support ticket has been created and our team will respond within 24 hours.</p>
          <div className="ticket-details">
            <h4>Ticket Details:</h4>
            <p><strong>Subject:</strong> {formData.subject}</p>
            <p><strong>Category:</strong> {formData.category}</p>
            <p><strong>Priority:</strong> {formData.priority}</p>
          </div>
          <div className="success-actions">
            <button 
              onClick={() => setSuccess(false)}
              className="create-another-btn"
            >
              Create Another Ticket
            </button>
            <button 
              onClick={() => window.location.href = '/support'}
              className="view-tickets-btn"
            >
              View My Tickets
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-ticket">
      <div className="create-ticket-header">
        <h2>Create Support Ticket</h2>
        <p>Fill out the form below and our support team will get back to you soon.</p>
      </div>

      <form onSubmit={handleSubmit} className="ticket-form">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category <span className="required">*</span>
          </label>
          <div className="category-options">
            {categories.map(category => (
              <label key={category.value} className="category-option">
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={formData.category === category.value}
                  onChange={handleChange}
                  className="category-radio"
                />
                <div className="category-card">
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-label">{category.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="priority" className="form-label">
            Priority Level
          </label>
          <div className="priority-options">
            {priorities.map(priority => (
              <label key={priority.value} className="priority-option">
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formData.priority === priority.value}
                  onChange={handleChange}
                  className="priority-radio"
                />
                <div 
                  className="priority-badge"
                  style={{ backgroundColor: priority.color }}
                >
                  {priority.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="subject" className="form-label">
            Subject <span className="required">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief description of your issue"
            className="form-input"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Detailed Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please provide as much detail as possible about your issue..."
            className="form-textarea"
            rows={6}
            required
            disabled={loading}
          />
          <div className="character-count">
            {formData.description.length} characters
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Ticket...' : 'Create Ticket'}
          </button>
        </div>
      </form>

      <div className="help-info">
        <h4>Need Immediate Help?</h4>
        <p>Call our 24/7 helpline: <strong>1800-XXX-XXXX</strong></p>
        <p>Or email us at: <strong>support@pharma.com</strong></p>
      </div>
    </div>
  )
}

export default CreateTicket
