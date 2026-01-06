import './TicketDetail.css'

function TicketDetail({ ticket }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return '#28a745'
      case 'IN_PROGRESS': return '#ffc107'
      case 'RESOLVED': return '#17a2b8'
      case 'CLOSED': return '#6c757d'
      default: return '#6c757d'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return '#28a745'
      case 'MEDIUM': return '#ffc107'
      case 'HIGH': return '#dc3545'
      case 'URGENT': return '#6f42c1'
      default: return '#6c757d'
    }
  }

  if (!ticket) {
    return (
      <div className="ticket-detail">
        <div className="no-ticket-selected">
          <div className="no-ticket-icon">📋</div>
          <h3>No Ticket Selected</h3>
          <p>Please select a ticket from the list to view details.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ticket-detail">
      <div className="ticket-header">
        <div className="ticket-info">
          <h2>#{ticket.ticketId} - {ticket.subject}</h2>
          <div className="ticket-meta">
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(ticket.status) }}
            >
              {ticket.status === 'OPEN' ? 'Open' : ticket.status.replace('_', ' ')}
            </span>
            <span 
              className="priority-badge"
              style={{ backgroundColor: getPriorityColor(ticket.priority) }}
            >
              {ticket.priority}
            </span>
            <span className="category-badge">{ticket.category}</span>
          </div>
        </div>
        <div className="ticket-date">
          Created: {formatDate(ticket.createdAt)}
        </div>
      </div>

      <div className="ticket-description">
        <h3>Description</h3>
        <p>{ticket.description}</p>
      </div>

      <div className="ticket-info-section">
        <h3>Ticket Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Status:</label>
            <span className={`status-value ${ticket.status.toLowerCase()}`}>
              {ticket.status === 'OPEN' ? 'Open' : ticket.status.replace('_', ' ')}
            </span>
          </div>
          <div className="info-item">
            <label>Priority:</label>
            <span className={`priority-value ${ticket.priority.toLowerCase()}`}>
              {ticket.priority}
            </span>
          </div>
          <div className="info-item">
            <label>Category:</label>
            <span className="category-value">{ticket.category}</span>
          </div>
          <div className="info-item">
            <label>Created:</label>
            <span className="date-value">{formatDate(ticket.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketDetail
