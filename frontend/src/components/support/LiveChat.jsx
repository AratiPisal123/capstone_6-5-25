import { useState, useEffect, useRef } from 'react'
import supportService from '../../services/supportService'
import './LiveChat.css'

function LiveChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [quickActions] = useState([
    { icon: '📦', text: 'Track Order', query: 'track my order' },
    { icon: '💳', text: 'Payment Help', query: 'payment methods' },
    { icon: '🚚', text: 'Delivery Info', query: 'delivery time' },
    { icon: '💊', text: 'Prescription', query: 'prescription upload' }
  ])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await supportService.sendChatMessage(messageText)
      
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: response.data.response,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
      }, 1000)
    } catch (error) {
      setTimeout(() => {
        const errorMessage = {
          id: Date.now() + 1,
          text: "Sorry, I'm having trouble connecting. Please try again or contact our support team directly.",
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
        setIsTyping(false)
      }, 1000)
    }
  }

  const handleQuickAction = (action) => {
    handleSendMessage(action.query)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSendMessage(inputMessage)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isMinimized) {
    return (
      <div className="live-chat minimized">
        <button 
          onClick={() => setIsMinimized(false)}
          className="chat-bubble"
        >
          <span className="chat-icon">💬</span>
          <span className="chat-label">Chat Support</span>
          <span className="expand-icon">↑</span>
        </button>
      </div>
    )
  }

  return (
    <div className="live-chat">
      <div className="chat-header">
        <div className="header-info">
          <h3>💬 AI Support Chat</h3>
          <span className="status-indicator online">Online</span>
        </div>
        <button 
          onClick={() => setIsMinimized(true)}
          className="minimize-btn"
        >
          −
        </button>
      </div>

      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-content">
              <p>{message.text}</p>
              <span className="message-time">{formatTime(message.timestamp)}</span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot typing">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-actions">
        <p className="quick-actions-label">Quick Actions:</p>
        <div className="action-buttons">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action)}
              className="action-btn"
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-text">{action.text}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
            disabled={isTyping}
          />
          <button 
            type="submit" 
            className="send-btn"
            disabled={!inputMessage.trim() || isTyping}
          >
            {isTyping ? '...' : 'Send'}
          </button>
        </div>
      </form>

      <div className="chat-footer">
        <p>Powered by AI • For complex issues, please create a support ticket</p>
      </div>
    </div>
  )
}

export default LiveChat
