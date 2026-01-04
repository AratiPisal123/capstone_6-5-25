import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../utils/api'

function EnhancedCataloguePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  // Filter states
  const [filters, setFilters] = useState({
    keyword: searchParams.get('search') || '',
    categoryId: searchParams.get('category') || '',
    brandId: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    requiresPrescription: searchParams.get('prescription') === 'true',
    inStock: searchParams.get('inStock') === 'true',
    sortBy: searchParams.get('sort') || 'popularity',
    sortOrder: searchParams.get('order') || 'desc'
  })

  // Mock data for demonstration
  useEffect(() => {
    // Mock categories
    setCategories([
      { id: 1, name: 'Vitamins & Supplements', count: 245 },
      { id: 2, name: 'Pain Relief', count: 189 },
      { id: 3, name: 'Diabetes Care', count: 156 },
      { id: 4, name: 'Cold & Flu', count: 134 },
      { id: 5, name: 'Digestive Health', count: 98 },
      { id: 6, name: 'First Aid', count: 76 },
      { id: 7, name: 'Personal Care', count: 203 },
      { id: 8, name: 'Baby Care', count: 87 }
    ])

    // Mock brands
    setBrands([
      { id: 1, name: 'PharmaCorp', count: 156 },
      { id: 2, name: 'MediPlus', count: 134 },
      { id: 3, name: 'HealthLife', count: 98 },
      { id: 4, name: 'VitaMax', count: 87 },
      { id: 5, name: 'CarePlus', count: 76 }
    ])

    // Mock products
    setProducts([
      { 
        id: 1, 
        name: 'Vitamin D3 1000IU', 
        price: 24.99, 
        stock: 150, 
        hasRx: false,
        category: 'Vitamins & Supplements',
        brand: 'VitaMax',
        rating: 4.5,
        reviews: 234,
        image: '/api/placeholder/200/200'
      },
      { 
        id: 2, 
        name: 'Ibuprofen 400mg', 
        price: 12.99, 
        stock: 89, 
        hasRx: false,
        category: 'Pain Relief',
        brand: 'PharmaCorp',
        rating: 4.2,
        reviews: 156,
        image: '/api/placeholder/200/200'
      },
      { 
        id: 3, 
        name: 'Metformin 500mg', 
        price: 18.50, 
        stock: 45, 
        hasRx: true,
        category: 'Diabetes Care',
        brand: 'MediPlus',
        rating: 4.7,
        reviews: 89,
        image: '/api/placeholder/200/200'
      },
      { 
        id: 4, 
        name: 'Omega-3 Fish Oil', 
        price: 29.99, 
        stock: 200, 
        hasRx: false,
        category: 'Vitamins & Supplements',
        brand: 'HealthLife',
        rating: 4.6,
        reviews: 312,
        image: '/api/placeholder/200/200'
      },
      { 
        id: 5, 
        name: 'Paracetamol 500mg', 
        price: 8.99, 
        stock: 300, 
        hasRx: false,
        category: 'Pain Relief',
        brand: 'PharmaCorp',
        rating: 4.3,
        reviews: 198,
        image: '/api/placeholder/200/200'
      },
      { 
        id: 6, 
        name: 'Insulin Glargine', 
        price: 125.00, 
        stock: 25, 
        hasRx: true,
        category: 'Diabetes Care',
        brand: 'MediPlus',
        rating: 4.8,
        reviews: 67,
        image: '/api/placeholder/200/200'
      }
    ])

    setPagination({
      page: 1,
      limit: 12,
      total: 156,
      totalPages: 13
    })
  }, [])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    updateURLParams(newFilters)
  }

  const updateURLParams = (filterValues) => {
    const params = new URLSearchParams()
    
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== '' && value !== false) {
        params.set(key, value)
      }
    })
    
    setSearchParams(params)
  }

  const applyFilters = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const clearFilters = () => {
    const clearedFilters = {
      keyword: '',
      categoryId: '',
      brandId: '',
      minPrice: '',
      maxPrice: '',
      requiresPrescription: false,
      inStock: false,
      sortBy: 'popularity',
      sortOrder: 'desc'
    }
    setFilters(clearedFilters)
    setSearchParams({})
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
        unitPrice: product.price
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

  const handleViewDetails = (product) => {
    navigate(`/products/${product.id}`)
  }

  const closeFilters = () => {
    setShowFilters(false)
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>)
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>)
    }

    return stars
  }

  return (
    <div className="enhanced-catalogue-page">
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
        <h2>Pharmacy Catalogue</h2>
        <div className="catalogue-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>
          
          <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
            <span className="filter-icon">☰</span> Filters
            {Object.values(filters).some(v => v && v !== '' && v !== false) && (
              <span className="filter-indicator">●</span>
            )}
          </button>
          
          <div className="sort-dropdown">
            <label>Sort:</label>
            <select 
              value={filters.sortBy} 
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="sort-select"
            >
              <option value="popularity">Popularity</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="catalogue-wrapper">
        {/* Filter overlay for mobile */}
        {showFilters && <div className="filter-overlay active" onClick={closeFilters}></div>}
        
        <aside className={`catalogue-filters ${showFilters ? 'open' : 'closed'}`}>
          <div className="filters-header">
            <h3>Filters</h3>
            <button className="close-filters-btn" onClick={closeFilters}>✕</button>
          </div>

          <div className="filter-section">
            <h4>Search</h4>
            <input
              type="text"
              placeholder="Product name..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-section">
            <h4>Categories</h4>
            <div className="filter-list">
              {categories.map(category => (
                <div key={category.id} className="filter-item">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    checked={filters.categoryId === category.id.toString()}
                    onChange={(e) => handleFilterChange('categoryId', e.target.checked ? category.id : '')}
                  />
                  <label htmlFor={`category-${category.id}`}>
                    {category.name} ({category.count})
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Brands</h4>
            <div className="filter-list">
              {brands.map(brand => (
                <div key={brand.id} className="filter-item">
                  <input
                    type="checkbox"
                    id={`brand-${brand.id}`}
                    checked={filters.brandId === brand.id.toString()}
                    onChange={(e) => handleFilterChange('brandId', e.target.checked ? brand.id : '')}
                  />
                  <label htmlFor={`brand-${brand.id}`}>
                    {brand.name} ({brand.count})
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="price-input"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="price-input"
              />
            </div>
            <div className="price-presets">
              <button onClick={() => handleFilterChange('maxPrice', 10)}>Under $10</button>
              <button onClick={() => {handleFilterChange('minPrice', 10); handleFilterChange('maxPrice', 50)}}>$10-$50</button>
              <button onClick={() => {handleFilterChange('minPrice', 50); handleFilterChange('maxPrice', 100)}}>$50-$100</button>
              <button onClick={() => handleFilterChange('minPrice', 100)}>Over $100</button>
            </div>
          </div>

          <div className="filter-section">
            <h4>Product Type</h4>
            <div className="filter-list">
              <div className="filter-item">
                <input
                  type="checkbox"
                  id="prescription-only"
                  checked={filters.requiresPrescription}
                  onChange={(e) => handleFilterChange('requiresPrescription', e.target.checked)}
                />
                <label htmlFor="prescription-only">Prescription Required</label>
              </div>
              <div className="filter-item">
                <input
                  type="checkbox"
                  id="in-stock"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                />
                <label htmlFor="in-stock">In Stock Only</label>
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <button className="apply-filters-btn" onClick={applyFilters}>
              Apply Filters
            </button>
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All
            </button>
          </div>
        </aside>

        <div className="catalogue-content">
          <div className="results-info">
            <span>Showing {products.length} of {pagination.total} products</span>
          </div>

          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                    {product.hasRx && <span className="rx-badge">Rx</span>}
                    {product.stock <= 20 && <span className="low-stock-badge">Low Stock</span>}
                  </div>
                  <div className="product-content">
                    <div className="product-header">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-rating">
                        {renderStars(product.rating)}
                        <span className="rating-count">({product.reviews})</span>
                      </div>
                    </div>
                    <div className="product-meta">
                      <span className="product-category">{product.category}</span>
                      <span className="product-brand">{product.brand}</span>
                    </div>
                    <div className="product-price-stock">
                      <span className="product-price">${product.price.toFixed(2)}</span>
                      <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="product-actions">
                      <button 
                        className="add-to-cart-btn" 
                        disabled={product.stock === 0}
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                      <button className="details-btn" onClick={() => handleViewDetails(product)}>
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button className="pagination-btn" disabled={pagination.page === 1}>
                Previous
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-number ${pagination.page === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              
              <button className="pagination-btn" disabled={pagination.page === pagination.totalPages}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedCataloguePage
