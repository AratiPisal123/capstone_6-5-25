function SupportPage() {
  return (
    <div className="support-page">
      <h2>Support</h2>

      <div className="support-cards">
        <div className="support-card">
          <div className="card-icon">📞</div>
          <h3>Contact Us</h3>
          <p>You can contact us via email phone.</p>
          <button className="contact-us-btn">Contact Us</button>
        </div>
        <div className="support-card">
          <div className="card-icon">❓</div>
          <h3>FAQs</h3>
          <p>Find answers to common questions.</p>
          <button className="view-faqs-btn">View FAQs</button>
        </div>
        <div className="support-card">
          <div className="card-icon">💬</div>
          <h3>Live Chat</h3>
          <p>Chat with our support team in time.</p>
          <button className="start-chat-btn">Start Chat</button>
        </div>
      </div>

      <h3>Recent Support Tickets</h3>
      <div className="tickets-grid">
        <div className="ticket-card">
          <h4>Ticket #12345</h4>
          <p>Issue with-order #3557565</p>
        </div>
        <div className="ticket-card">
          <h4>Ticket #12844</h4>
          <p>Question aot subscription plan</p>
          <span className="status-badge resolved">Resolved</span>
        </div>
      </div>

      <button className="view-all-tickets-btn">View All Tickets</button>
    </div>
  )
}

export default SupportPage
