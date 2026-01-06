import { useState } from 'react'
import supportService from '../../services/supportService'
import './ContactForm.css'

function ContactForm() {
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      await supportService.sendContactMessage(formData)
      setSuccess(true)
      
      // Reset form
      setFormData({
        subject: '',
        message: ''
      })

    } catch (err) {
      setError('Failed to send message. Please try again.')
      console.error('Error sending contact message:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="contact-form">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h3>Message Sent Successfully!</h3>
          <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="send-another-btn"
          >
            Send Another Message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="contact-form">
      <div className="contact-header">
        <h2>Contact Support</h2>
        <p>Send us a message and we'll respond as soon as possible.</p>
      </div>

      <div className="contact-info-grid">
        <div className="contact-card">
          <div className="contact-icon">📞</div>
          <h4>Phone Support</h4>
          <p>24/7 Helpline</p>
          <a href="tel:1800-XXX-XXXX" className="contact-link">1800-XXX-XXXX</a>
        </div>

        <div className="contact-card">
          <div className="contact-icon">📧</div>
          <h4>Email Support</h4>
          <p>We respond within 24 hours</p>
          <a href="mailto:support@pharma.com" className="contact-link">support@pharma.com</a>
        </div>

        <div className="contact-card">
          <div className="contact-icon">💬</div>
          <h4>Live Chat</h4>
          <p>Instant AI assistance</p>
          <button className="contact-link chat-btn">Start Chat</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <h3>Send us a Message</h3>
        
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

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
            placeholder="What's this about?"
            className="form-input"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="message" className="form-label">
            Message <span className="required">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us more about your issue or question..."
            className="form-textarea"
            rows={6}
            required
            disabled={loading}
          />
          <div className="character-count">
            {formData.message.length} characters
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ContactForm
