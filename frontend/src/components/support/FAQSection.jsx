import { useState, useEffect } from 'react'
import supportService from '../../services/supportService'
import './FAQSection.css'

function FAQSection() {
  const [faqs, setFaqs] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedFAQ, setExpandedFAQ] = useState(null)

  useEffect(() => {
    fetchFAQsAndCategories()
  }, [])

  useEffect(() => {
    console.log('Category changed to:', selectedCategory)
    if (selectedCategory === 'all') {
      fetchAllFAQs()
    } else {
      fetchFAQsByCategory(selectedCategory)
    }
  }, [selectedCategory])

  const fetchFAQsAndCategories = async () => {
    try {
      console.log('Fetching FAQ categories...')
      const [categoriesResponse] = await Promise.all([
        supportService.getFAQCategories()
      ])
      console.log('Categories response:', categoriesResponse)
      setCategories(['all', ...(categoriesResponse.data || [])])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchAllFAQs = async () => {
    try {
      setLoading(true)
      console.log('Fetching all FAQs...')
      const response = await supportService.getAllFAQs()
      console.log('FAQs response:', response)
      setFaqs(response.data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching FAQs:', err)
      setError('Failed to load FAQs')
    } finally {
      setLoading(false)
    }
  }

  const fetchFAQsByCategory = async (category) => {
    try {
      setLoading(true)
      console.log('Fetching FAQs for category:', category)
      const response = await supportService.getFAQsByCategory(category)
      console.log('Category FAQs response:', response)
      setFaqs(response.data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching FAQs by category:', err)
      setError('Failed to load FAQs')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (query.trim()) {
      try {
        setLoading(true)
        console.log('Searching FAQs with query:', query)
        const response = await supportService.searchFAQs(query)
        console.log('Search response:', response)
        setFaqs(response.data || [])
        setError(null)
      } catch (err) {
        console.error('Error searching FAQs:', err)
        setError('Failed to search FAQs')
      } finally {
        setLoading(false)
      }
    } else {
      if (selectedCategory === 'all') {
        fetchAllFAQs()
      } else {
        fetchFAQsByCategory(selectedCategory)
      }
    }
  }

  const toggleFAQ = (faqId) => {
    console.log('Toggling FAQ:', faqId, 'Current expanded:', expandedFAQ)
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId)
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'ORDER': '📦',
      'PAYMENT': '💳',
      'DELIVERY': '🚚',
      'PRODUCT': '💊',
      'PRESCRIPTION': '📋',
      'OTHER': '📝'
    }
    return icons[category] || '❓'
  }

  if (loading && faqs.length === 0) {
    return (
      <div className="faq-section">
        <div className="faq-header">
          <h2>Frequently Asked Questions</h2>
          <p>Find answers to common questions about our services</p>
        </div>
        <div className="loading-faqs">
          <div className="loading-spinner"></div>
          <p>Loading FAQs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="faq-section">
      <div className="faq-header">
        <h2>Frequently Asked Questions</h2>
        <p>Find answers to common questions about our services</p>
      </div>

      <div className="faq-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={() => {
            if (selectedCategory === 'all') {
              fetchAllFAQs()
            } else {
              fetchFAQsByCategory(selectedCategory)
            }
          }} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      <div className="faq-list">
        {faqs.length === 0 ? (
          <div className="no-faqs">
            <div className="no-faqs-icon">🔍</div>
            <h3>No FAQs Found</h3>
            <p>
              {searchQuery 
                ? `No results found for "${searchQuery}". Try different keywords.` 
                : 'No FAQs available in this category.'
              }
            </p>
          </div>
        ) : (
          faqs.map(faq => (
            <div key={faq.faqId} className="faq-item">
              <button
                onClick={() => toggleFAQ(faq.faqId)}
                className={`faq-question ${expandedFAQ === faq.faqId ? 'expanded' : ''}`}
              >
                <div className="question-content">
                  <span className="category-badge">{faq.category}</span>
                  <h3>{faq.question}</h3>
                </div>
                <span className="expand-icon">
                  {expandedFAQ === faq.faqId ? '−' : '+'}
                </span>
              </button>
              
              {expandedFAQ === faq.faqId && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="faq-footer">
        <div className="help-card">
          <h4>Still need help?</h4>
          <p>Can't find what you're looking for? Our support team is here to help!</p>
          <div className="help-actions">
            <button className="chat-btn">💬 Start Live Chat</button>
            <button className="contact-btn">📧 Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQSection
