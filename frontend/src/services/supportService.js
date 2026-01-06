import api from './api'

const supportService = {
  // Ticket Management
  getUserTickets: async () => {
    const response = await api.get('/api/support/tickets')
    return response
  },

  createTicket: async (ticketData) => {
    const response = await api.post('/api/support/tickets', ticketData)
    return response
  },

  updateTicket: async (ticketId, ticketData) => {
    const response = await api.put(`/api/support/tickets/${ticketId}`, ticketData)
    return response
  },

  getTicketMessages: async (ticketId) => {
    const response = await api.get(`/api/support/tickets/${ticketId}`)
    return response
  },

  addMessage: async (ticketId, message) => {
    const response = await api.post(`/api/support/tickets/${ticketId}/messages`, {
      message: message
    })
    return response
  },

  updateTicketStatus: async (ticketId, status) => {
    const response = await api.put(`/api/support/tickets/${ticketId}/status`, {
      status: status
    })
    return response
  },

  // FAQ Management
  getAllFAQs: async () => {
    const response = await api.get('/api/support/faqs')
    return response
  },

  getFAQsByCategory: async (category) => {
    const response = await api.get(`/api/support/faqs/category/${category}`)
    return response
  },

  searchFAQs: async (search) => {
    const response = await api.get(`/api/support/faqs/search?q=${search}`)
    return response
  },

  getFAQCategories: async () => {
    const response = await api.get('/api/support/faqs/categories')
    return response
  },

  // Live Chat
  sendChatMessage: async (message) => {
    const response = await api.post('/api/support/chat', {
      message: message
    })
    return response.data
  },

  // Contact Form
  sendContactMessage: async (contactData) => {
    const response = await api.post('/api/support/contact', contactData)
    return response.data
  }
}

export default supportService
