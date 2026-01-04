import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../utils/api'
import { useToast } from '../../contexts/ToastContext'
import './ProductDetailPage.css'

function ProductDetailPage() {
  const { sku, id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [relatedProducts, setRelatedProducts] = useState([])
  const [userRating, setUserRating] = useState(0)
  const [reviewForm, setReviewForm] = useState({
    name: '',
    review: ''
  })

  const { success, error: toastError, info } = useToast()

  useEffect(() => {
    console.log('ProductDetailPage - URL params:', { sku, id })
    if (id) {
      console.log('ProductDetailPage - Fetching details for ID:', id)
      fetchProductDetails(id)
      fetchRelatedProducts(id)
    } else if (sku) {
      console.log('ProductDetailPage - Fetching details for SKU:', sku)
      fetchProductDetails(sku)
      fetchRelatedProducts(sku)
    } else {
      console.log('ProductDetailPage - No ID or SKU provided')
      setLoading(false)
    }
  }, [sku, id])

  const fetchProductDetails = async (productId) => {
    try {
      setLoading(true)
      console.log('Fetching product details for ID:', productId)
      const response = await apiRequest(`/api/products/${productId}`)
      console.log('Product details response:', response)
      
      // Handle both single product and array of products
      if (response && Array.isArray(response)) {
        // If response is an array, find the product with matching ID
        const product = response.find(p => p.id === parseInt(productId))
        console.log('Found product in array:', product)
        setProduct(product)
      } else if (response && typeof response === 'object') {
        // If response is a single object
        console.log('Found single product object:', response)
        setProduct(response)
      } else {
        console.warn('Invalid product data received:', response)
        setProduct(null)
      }
      
      if (response && response.images && response.images.length > 0) {
        setActiveImage(0)
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = () => {
    // Handle review submission
    console.log('Review submitted:', { userRating, ...reviewForm })
    success('Thank you for your review!')
    
    // Reset form
    setUserRating(0)
    setReviewForm({ name: '', review: '' })
  }

  const handleSubscribe = async () => {
    try {
      // Create subscription for the current product
      const subscriptionData = {
        productId: product.id || product.sku,
        quantity: quantity,
        frequency: 'monthly', // Default frequency
        deliveryAddress: '', // User can update this later
        specialInstructions: '',
        nextDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Format as YYYY-MM-DD
        remainingDeliveries: 12 // Default 1 year subscription
      }
      
      const response = await apiRequest('/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify(subscriptionData)
      })
      
      console.log('Subscription created:', response)
      success(`Subscription created for ${product.name}!`)
      
      // Navigate to subscriptions page to show the active subscription
      navigate('/subscriptions')
    } catch (error) {
      console.error('Failed to create subscription:', error)
      
      // Handle duplicate subscription error gracefully
      if (error.message.includes('Active subscription already exists for this product')) {
        success(`You already have an active subscription for ${product.name}! Check your subscriptions page to manage it.`)
        navigate('/subscriptions')
      } else {
        toastError('Failed to create subscription. Please try again.')
      }
    }
  }

  const fetchRelatedProducts = async (productSku) => {
    try {
      // For now, we'll skip related products since the search endpoint doesn't exist
      // In the future, this could be implemented with a proper search endpoint
      console.log('Related products feature not yet implemented - skipping');
      setRelatedProducts([]);
    } catch (error) {
      console.error('Failed to fetch related products:', error);
      setRelatedProducts([]);
    }
  }

  const handleAddToCart = async () => {
    if (!product || !product.inStock) return

    try {
      const cartItem = {
        productId: product.id || product.sku,
        quantity: quantity,
        unitPrice: product.currentPrice || product.mrp
      }
      
      await apiRequest('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify(cartItem)
      })
      
      success(`${product.name} added to cart`)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      toastError('Failed to add to cart')
    }
  }

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product.totalStock || 10)) {
      setQuantity(newQuantity)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <div className="loading-spinner">Loading product details...</div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <h2>Product not found</h2>
          <button onClick={() => navigate('/catalogue')} className="back-btn">
            Back to Catalogue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate('/catalogue')}>Home</span>
        <span className="separator">/</span>
        <span onClick={() => navigate('/catalogue')}>Medicines</span>
        <span className="separator">/</span>
        <span className="current">{product.name}</span>
      </div>

      <div className="product-detail-container">
        {/* Product Images */}
        <div className="product-images-section">
          {/* Wishlist Button in Upper Right Corner */}
          <button 
            className="image-wishlist-btn"
            onClick={() => {
              // Add to wishlist functionality
              success('Added to wishlist!')
            }}
            title="Add to Wishlist"
          >
            <span className="heart-icon">❤️</span>
          </button>
          
          <div className="main-image">
            {product.imageUrl && (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="product-main-image"
              />
            )}
          </div>
          
          {/* Check if there are multiple images */}
          {product.images && Array.isArray(product.images) && product.images.length > 1 && (
            <div className="image-thumbnails">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="product-info-section">
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-rating">
              <div className="stars">
                <span className="star">⭐</span>
                <span className="star">⭐</span>
                <span className="star">⭐</span>
                <span className="star">⭐</span>
                <span className="star">⭐</span>
              </div>
              <span className="rating-text">(4.5 out of 5)</span>
            </div>
            <div className="product-meta">
              {product.brand && <span className="brand">{product.brand}</span>}
              {product.sku && <span className="sku">SKU: {product.sku}</span>}
            </div>
          </div>

          <div className="product-pricing">
            <div className="price-section">
              <span className="current-price">{formatPrice(product.mrp || product.currentPrice)}</span>
              {product.originalPrice && product.originalPrice > product.mrp && (
                <span className="original-price">{formatPrice(product.originalPrice)}</span>
              )}
              {product.discount && (
                <span className="discount-badge">{product.discount}% OFF</span>
              )}
            </div>
          </div>

          <div className="stock-info">
            <span className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
              {product.inStock ? `${product.totalStock} units in stock` : 'Out of Stock'}
            </span>
          </div>

          {/* Action Section */}
          <div className="action-section">
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  min="1"
                  max={product.totalStock || 10}
                  className="quantity-input"
                />
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= (product.totalStock || 10)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
                disabled={!product.inStock}
                onClick={handleAddToCart}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              
              <button 
                className="subscribe-btn"
                onClick={handleSubscribe}
              >
                Subscribe
              </button>
              
              <button 
                className="wishlist-btn"
                onClick={() => {
                  // Add to wishlist functionality
                  success('Added to wishlist!')
                }}
              >
                <span className="heart-icon">❤️</span>
              </button>
            </div>
          </div>

          <div className="product-tabs">
            <div className="tab-headers">
              <button 
                className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`tab-header ${activeTab === 'composition' ? 'active' : ''}`}
                onClick={() => setActiveTab('composition')}
              >
                Composition
              </button>
              <button 
                className={`tab-header ${activeTab === 'usage' ? 'active' : ''}`}
                onClick={() => setActiveTab('usage')}
              >
                Usage & Dosage
              </button>
              <button 
                className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
              <button 
                className={`tab-header ${activeTab === 'side-effects' ? 'active' : ''}`}
                onClick={() => setActiveTab('side-effects')}
              >
                Side Effects
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="tab-pane">
                  <h3>Product Description</h3>
                  <p>{product.description || 'No description available for this product.'}</p>
                  
                  {product.features && product.features.length > 0 && (
                    <div className="features">
                      <h4>Key Features</h4>
                      <ul>
                        {product.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'composition' && (
                <div className="tab-pane">
                  <h3>Composition</h3>
                  <p>{product.composition || 'Composition information not available.'}</p>
                  
                  {product.activeIngredients && product.activeIngredients.length > 0 && (
                    <div className="ingredients">
                      <h4>Active Ingredients</h4>
                      <ul>
                        {product.activeIngredients.map((ingredient, index) => (
                          <li key={index}>
                            <strong>{ingredient.name}:</strong> {ingredient.strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'usage' && (
                <div className="tab-pane">
                  <h3>Usage & Dosage</h3>
                  <p>{product.usage || 'Consult your doctor for proper usage instructions.'}</p>
                  
                  {product.dosageInstructions && (
                    <div className="dosage-info">
                      <h4>Dosage Instructions</h4>
                      <p>{product.dosageInstructions}</p>
                    </div>
                  )}
                  
                  {product.warnings && (
                    <div className="warnings">
                      <h4>Warnings</h4>
                      <ul>
                        {product.warnings.map((warning, index) => (
                          <li key={index} className="warning-item">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'side-effects' && (
                <div className="tab-pane">
                  <h3>Side Effects</h3>
                  <p>{product.sideEffects || 'Side effects information not available. Please consult your healthcare provider.'}</p>
                  
                  {product.commonSideEffects && product.commonSideEffects.length > 0 && (
                    <div className="side-effects-list">
                      <h4>Common Side Effects</h4>
                      <ul>
                        {product.commonSideEffects.map((effect, index) => (
                          <li key={index} className="side-effect">{effect}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {product.severeSideEffects && product.severeSideEffects.length > 0 && (
                    <div className="severe-effects">
                      <h4>Severe Side Effects (Seek Medical Attention)</h4>
                      <ul>
                        {product.severeSideEffects.map((effect, index) => (
                          <li key={index} className="severe-effect">{effect}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="tab-pane">
                  <h3>Customer Reviews</h3>
                  
                  {/* Review Submission Form */}
                  <div className="review-submission-form">
                    <h4>Write Your Review</h4>
                    <div className="rating-input">
                      <label>Your Rating:</label>
                      <div className="star-rating-input">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="star-btn"
                            onClick={() => setUserRating(star)}
                          >
                            <span className={userRating >= star ? 'star filled' : 'star empty'}>⭐</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="review-form-group">
                      <label>Your Name:</label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                        className="review-input"
                      />
                    </div>
                    
                    <div className="review-form-group">
                      <label>Your Review:</label>
                      <textarea
                        placeholder="Share your experience with this product..."
                        value={reviewForm.review}
                        onChange={(e) => setReviewForm({...reviewForm, review: e.target.value})}
                        className="review-textarea"
                        rows="4"
                      />
                    </div>
                    
                    <button 
                      className="submit-review-btn"
                      onClick={handleSubmitReview}
                      disabled={!userRating || !reviewForm.name || !reviewForm.review}
                    >
                      Submit Review
                    </button>
                  </div>

                  {/* Existing Reviews */}
                  <div className="existing-reviews">
                    <h4>Customer Reviews</h4>
                    <div className="reviews-list">
                      <div className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <div className="reviewer-avatar">👤</div>
                            <div className="reviewer-details">
                              <h5>Rahul Sharma</h5>
                              <div className="review-rating">
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                              </div>
                            </div>
                          </div>
                          <span className="review-date">2 days ago</span>
                        </div>
                        <div className="review-content">
                          <p>Very effective medicine for cold and headache. Works quickly without any side effects. Highly recommend!</p>
                        </div>
                      </div>

                      <div className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <div className="reviewer-avatar">👤</div>
                            <div className="reviewer-details">
                              <h5>Priya Patel</h5>
                              <div className="review-rating">
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                                <span className="star empty">⭐</span>
                              </div>
                            </div>
                          </div>
                          <span className="review-date">1 week ago</span>
                        </div>
                        <div className="review-content">
                          <p>Good product for fever relief. The only issue is that it makes me a bit drowsy. But overall effective.</p>
                        </div>
                      </div>

                      <div className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <div className="reviewer-avatar">👤</div>
                            <div className="reviewer-details">
                              <h5>Amit Kumar</h5>
                              <div className="review-rating">
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                                <span className="star">⭐</span>
                              </div>
                            </div>
                          </div>
                          <span className="review-date">2 weeks ago</span>
                        </div>
                        <div className="review-content">
                          <p>Excellent medicine! Always keep it in my first aid kit. Fast relief from headache and body pain.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Badges */}
          <div className="product-badges">
            {product.prescriptionRequired && (
              <div className="badge prescription">Prescription Required</div>
            )}
            {product.isOrganic && (
              <div className="badge organic">Organic</div>
            )}
            {product.isVegetarian && (
              <div className="badge vegetarian">Vegetarian</div>
            )}
            {product.expiryDate && (
              <div className="expiry-info">
                Expires: {new Date(product.expiryDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h2>Related Products</h2>
          <div className="related-products-grid">
            {relatedProducts.map(relatedProduct => (
              <div key={relatedProduct.id} className="related-product-card">
                <div className="related-product-image">
                  {relatedProduct.imageUrl ? (
                    <img src={relatedProduct.imageUrl} alt={relatedProduct.name} />
                  ) : (
                    <div className="placeholder">💊</div>
                  )}
                </div>
                <div className="related-product-info">
                  <h4>{relatedProduct.name}</h4>
                  <p className="related-price">{formatPrice(relatedProduct.mrp)}</p>
                  <button 
                    onClick={() => {
                      if (relatedProduct.sku) {
                        navigate(`/products/${relatedProduct.sku}`)
                      }
                    }}
                    className="view-related-btn"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetailPage
