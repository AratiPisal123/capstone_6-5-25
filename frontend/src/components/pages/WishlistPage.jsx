import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../utils/api'
import './catalogue-page.css'

function WishlistPage() {
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setWishlist([])
          return
        }

        const response = await apiRequest('/api/wishlist')
        setWishlist(Array.isArray(response) ? response : [])
      } catch (error) {
        console.error('Failed to fetch wishlist:', error)
        setWishlist([])
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [])

  const handleRemoveFromWishlist = async (product) => {
    try {
      await apiRequest(`/api/wishlist/${product.id}`, { method: 'DELETE' })
      setWishlist(prev => prev.filter(item => item.id !== product.id))
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(''), 3000)
  }

  const handleAddToCart = async (product) => {
    try {
      const cartItem = {
        productId: product.id,
        quantity: 1,
        unitPrice: product.mrp || product.currentPrice
      }
      
      await apiRequest('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify(cartItem)
      })
      
      showMessage(`${product.name} added to cart!`, 'success')
    } catch (error) {
      console.error('Failed to add to cart:', error)
      showMessage('Failed to add to cart. Please try again.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="catalogue-page">
        <div className="loading-spinner">Loading wishlist...</div>
      </div>
    )
  }

  return (
    <div className="catalogue-page">
      {/* Message Display */}
      {message && (
        <div className="message-display">
          <div className={`message ${message.type || 'success'}`}>
            {message.text || message}
            <button className="message-close" onClick={() => setMessage('')}>×</button>
          </div>
        </div>
      )}
      
      <div className="catalogue-header">
        <h2>My Wishlist ({wishlist.length} items)</h2>
      </div>
      
      {wishlist.length === 0 ? (
        <div className="no-products">
          <h3>Your wishlist is empty</h3>
          <p>Add products to your wishlist to see them here</p>
          <button onClick={() => navigate('/catalogue')}>
            Browse Products
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {wishlist.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.altText || product.name}
                    className="product-image"
                  />
                ) : (
                  <div className="product-image-placeholder">
                    <div className="placeholder-icon">💊</div>
                    <span>No Image</span>
                  </div>
                )}
                {product.prescriptionRequired && (
                  <div className="prescription-badge">Rx</div>
                )}
                <button 
                  className="wishlist-btn active"
                  onClick={() => handleRemoveFromWishlist(product)}
                  title="Remove from Wishlist"
                >
                  <span className="heart-icon">❤️</span>
                </button>
              </div>
              
              <div className="product-info">
                <div className="product-header">
                  <h3 className="product-name">{product.name}</h3>
                </div>
                
                <div className="product-pricing">
                  <div className="price-row">
                    <span className="current-price">₹{product.mrp || product.currentPrice}</span>
                  </div>
                </div>
                
                <div className="product-stock">
                  <span className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                    {product.inStock ? `${product.totalStock} in stock` : 'Out of Stock'}
                  </span>
                </div>
                
                <div className="product-actions">
                  <button 
                    className={`action-btn add-to-cart ${!product.inStock ? 'disabled' : ''}`}
                    disabled={!product.inStock}
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="action-btn view-details"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WishlistPage
