import './SupportSidebar.css'

function SupportSidebar({ activeTab, onTabChange, ticketCount }) {
  const menuItems = [
    { id: 'tickets', label: 'My Tickets', icon: '📋', count: ticketCount },
    { id: 'create', label: 'Create Ticket', icon: '➕' },
    { id: 'faq', label: 'FAQs', icon: '❓' },
    { id: 'chat', label: 'Live Chat', icon: '💬' },
    { id: 'contact', label: 'Contact Us', icon: '📧' }
  ]

  return (
    <div className="support-sidebar">
      <div className="sidebar-header">
        <h3>Support Center</h3>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.count !== undefined && (
              <span className="nav-count">{item.count}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="contact-info">
          <p>📞 24/7 Helpline</p>
          <p>1800-XXX-XXXX</p>
        </div>
        <div className="contact-info">
          <p>📧 Email Support</p>
          <p>support@pharma.com</p>
        </div>
      </div>
    </div>
  )
}

export default SupportSidebar
