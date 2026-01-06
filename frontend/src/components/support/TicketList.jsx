import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import supportService from '../../services/supportService'
import './TicketList.css'

function TicketList({ onTicketSelect, onTicketCountUpdate, selectedTicket, onUpdateTicket }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const user = useSelector(state => state.auth?.user)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      console.log('Fetching tickets...')
      const response = await supportService.getUserTickets()
      console.log('Tickets response:', response)
      const tickets = response.data || []
      console.log('Tickets data:', tickets)
      setTickets(tickets)
      setError(null)
      
      // Update ticket count in parent component
      if (onTicketCountUpdate) {
        onTicketCountUpdate(tickets.length)
      }
    } catch (err) {
      console.error('Error fetching tickets:', err)
      setError('Failed to load tickets. Please try again.')
      if (onTicketCountUpdate) {
        onTicketCountUpdate(0)
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return '#ff4757'
      case 'PENDING_USER': return '#ffa502'
      case 'PENDING_INTERNAL': return '#3742fa'
      case 'RESOLVED': return '#2ed573'
      case 'CLOSED': return '#747d8c'
      default: return '#747d8c'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return '#ff4757'
      case 'MEDIUM': return '#ffa502'
      case 'LOW': return '#2ed573'
      default: return '#747d8c'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="ticket-list loading">
        <div className="loading-spinner"></div>
        <p>Loading your tickets...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ticket-list error">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchTickets} className="retry-btn">Retry</button>
        </div>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="ticket-list empty">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Support Tickets Yet</h3>
          <p>You haven't created any support tickets. Create your first ticket to get help from our support team.</p>
          
          {/* Simple FAQ Section */}
          <div className="simple-faq-section">
            <h4>📚 Quick Help - Common Questions</h4>
            <div className="faq-items">
              <div className="faq-item">
                <h5>How do I track my order?</h5>
                <p>You can track your order by going to your account dashboard and clicking on "My Orders". You can also use the tracking number sent to your email.</p>
              </div>
              <div className="faq-item">
                <h5>What payment methods do you accept?</h5>
                <p>We accept credit/debit cards, UPI, net banking, and cash on delivery. All payment methods are secure and encrypted.</p>
              </div>
              <div className="faq-item">
                <h5>How long does delivery take?</h5>
                <p>Standard delivery takes 3-5 business days. Express delivery is available in select cities for an additional charge.</p>
              </div>
              <div className="faq-item">
                <h5>How do I upload a prescription?</h5>
                <p>During checkout, you can upload your prescription by clicking on the "Upload Prescription" button. Make sure the prescription is clear and valid.</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => onTicketSelect && onTicketSelect(null)}
            className="create-first-ticket-btn"
          >
            Create Your First Ticket
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ticket-list">
      <div className="ticket-list-header">
        <h2>My Tickets</h2>
        {selectedTicket && (
          <button 
            onClick={() => onUpdateTicket && onUpdateTicket(selectedTicket)}
            className="update-selected-ticket-btn"
          >
            ✏️ Update Selected Ticket
          </button>
        )}
      </div>

      <div className="tickets-grid">
        {tickets.map(ticket => (
          <div 
            key={ticket.ticketId} 
            className="ticket-card"
            onClick={() => onTicketSelect && onTicketSelect(ticket)}
          >
            <div className="ticket-header">
              <div className="ticket-info">
                <h4>#{ticket.ticketId}</h4>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(ticket.status) }}
                >
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <div className="ticket-priority">
                <span 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                >
                  {ticket.priority}
                </span>
              </div>
            </div>

            <div className="ticket-subject">
              <h3>{ticket.subject}</h3>
            </div>

            <div className="ticket-description">
              <p>{ticket.description.substring(0, 150)}{ticket.description.length > 150 ? '...' : ''}</p>
            </div>

            <div className="ticket-meta">
              <div className="ticket-category">
                <span className="category-icon">🏷️</span>
                <span>{ticket.category}</span>
              </div>
              <div className="ticket-date">
                <span className="date-icon">📅</span>
                <span>{formatDate(ticket.createdAt)}</span>
              </div>
            </div>

            <div className="ticket-footer">
              <button className="view-details-btn">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TicketList
