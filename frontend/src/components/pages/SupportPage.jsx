import { useState } from 'react'
import { useSelector } from 'react-redux'
import SupportSidebar from '../support/SupportSidebar'
import TicketList from '../support/TicketList'
import TicketDetail from '../support/TicketDetail'
import CreateTicket from '../support/CreateTicket'
import UpdateTicket from '../support/UpdateTicket'
import FAQSection from '../support/FAQSection'
import LiveChat from '../support/LiveChat'
import ContactForm from '../support/ContactForm'
import './SupportPage.css'

function SupportPage() {
  const [activeTab, setActiveTab] = useState('tickets')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [ticketCount, setTicketCount] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const user = useSelector(state => state.auth?.user)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedTicket(null)
  }

  const handleTicketSelect = (ticket) => {
    if (isUpdating) {
      // If we're in update mode, just update the selected ticket
      setSelectedTicket(ticket)
    } else if (ticket === null) {
      // If ticket is null, go to create tab (for "Create First Ticket" button)
      setActiveTab('create')
      setSelectedTicket(null)
    } else {
      // Normal selection - go to detail view
      setSelectedTicket(ticket)
      setActiveTab('detail')
    }
  }

  const handleTicketCreated = (newTicket) => {
    setSelectedTicket(newTicket)
    setActiveTab('detail')
    // Refresh ticket count after creating a ticket
    setTicketCount(prev => prev + 1)
    // Also refresh the ticket list by switching to tickets tab briefly
    setTimeout(() => {
      setActiveTab('tickets')
      setTimeout(() => {
        setActiveTab('detail')
      }, 100)
    }, 500)
  }

  const handleUpdateTicket = (ticket) => {
    setSelectedTicket(ticket)
    setIsUpdating(true)
    setActiveTab('update')
  }

  const handleTicketUpdated = (updatedTicket) => {
    setSelectedTicket(updatedTicket)
    setIsUpdating(false)
    setActiveTab('detail')
    // Briefly refresh the ticket list
    setTimeout(() => {
      setActiveTab('tickets')
      setTimeout(() => {
        setActiveTab('detail')
      }, 100)
    }, 500)
  }

  const handleCancelUpdate = () => {
    setIsUpdating(false)
    setActiveTab('tickets')
  }

  const handleTicketCountUpdate = (count) => {
    setTicketCount(count)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'tickets':
        return <TicketList onTicketSelect={handleTicketSelect} onTicketCountUpdate={handleTicketCountUpdate} selectedTicket={selectedTicket} onUpdateTicket={handleUpdateTicket} />
      case 'create':
        return <CreateTicket onTicketCreated={handleTicketCreated} />
      case 'detail':
        return <TicketDetail ticket={selectedTicket} />
      case 'update':
        return <UpdateTicket ticket={selectedTicket} onTicketUpdated={handleTicketUpdated} onCancel={handleCancelUpdate} />
      case 'faq':
        return <FAQSection />
      case 'chat':
        return <LiveChat />
      case 'contact':
        return <ContactForm />
      default:
        return <TicketList onTicketSelect={handleTicketSelect} onTicketCountUpdate={handleTicketCountUpdate} selectedTicket={selectedTicket} onUpdateTicket={handleUpdateTicket} />
    }
  }

  return (
    <div className="support-page">
      <div className="support-header">
        <h1>Customer Support</h1>
        <p>We're here to help you 24/7</p>
      </div>
      
      <div className="support-layout">
        <SupportSidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          ticketCount={ticketCount}
        />
        
        <div className="support-content">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default SupportPage
