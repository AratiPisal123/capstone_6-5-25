import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../utils/api'
import './catalogue-page.css'

function CataloguePage() {
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [rootCategories, setRootCategories] = useState([])
  const [rootBrands, setRootBrands] = useState([])
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [expandedBrands, setExpandedBrands] = useState(new Set())
  const [dosageForms, setDosageForms] = useState([])
  const [activeIngredients, setActiveIngredients] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    categoryTypes: [],
    brandTypes: [],
    priceRange: '',
    prescriptionRequired: null,
    dosageForms: [],
    activeIngredients: [],
    expiryRange: '',
    stockRange: '',
    inStock: true
  })
  const [sortBy, setSortBy] = useState('name')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchWishlist()
    fetchProducts()
    fetchCategories()
    fetchBrands()
    fetchRootCategories()
    fetchRootBrands()
    fetchDosageForms()
    fetchActiveIngredients()
  }, [])

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
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [filters, sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await apiRequest('/api/products')
      setProducts(response)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      showMessage('Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      // Temporarily disable categories fetch to avoid 404 error
      // const response = await apiRequest('/api/categories')
      // setCategories(response)
      setCategories([])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      // Temporarily disable brands fetch to avoid 404 error
      // const response = await apiRequest('/api/brands')
      // setBrands(response)
      setBrands([])
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const fetchRootCategories = async () => {
    try {
      // Temporarily disable root categories fetch to avoid 404 error
      // const response = await apiRequest('/api/categories/root')
      // setRootCategories(response)
      setRootCategories([])
    } catch (error) {
      console.error('Failed to fetch root categories:', error)
    }
  }

  const fetchRootBrands = async () => {
    try {
      // Temporarily disable brands fetch to avoid 404 error
      // const response = await apiRequest('/api/brands/root')
      // setRootBrands(response)
      setRootBrands([])
    } catch (error) {
      console.error('Failed to fetch root brands:', error)
    }
  }

  const fetchDosageForms = async () => {
    try {
      // For now, use static dosage forms - can be made dynamic later
      const forms = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Inhaler', 'Patch', 'Powder', 'Gel']
      setDosageForms(forms)
    } catch (error) {
      console.error('Failed to fetch dosage forms:', error)
    }
  }

  const fetchActiveIngredients = async () => {
    try {
      // For now, use static active ingredients - can be made dynamic later
      const ingredients = ['Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Aspirin', 'Caffeine', 'Vitamin C', 'Vitamin D', 'Calcium', 'Iron', 'Zinc']
      setActiveIngredients(ingredients)
    } catch (error) {
      console.error('Failed to fetch active ingredients:', error)
    }
  }

  const handleCategoryChange = (categoryId, checked) => {
    setFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, categoryId]
        : prev.categories.filter(id => id !== categoryId)
    }))
  }

  const handleBrandChange = (brandId, checked) => {
    setFilters(prev => ({
      ...prev,
      brands: checked 
        ? [...prev.brands, brandId]
        : prev.brands.filter(id => id !== brandId)
    }))
  }

  const handleCategoryTypeChange = (type, checked) => {
    setFilters(prev => ({
      ...prev,
      categoryTypes: checked 
        ? [...prev.categoryTypes, type]
        : prev.categoryTypes.filter(t => t !== type)
    }))
  }

  const handleBrandTypeChange = (type, checked) => {
    setFilters(prev => ({
      ...prev,
      brandTypes: checked 
        ? [...prev.brandTypes, type]
        : prev.brandTypes.filter(t => t !== type)
    }))
  }

  const handlePriceRangeChange = (range) => {
    setFilters(prev => ({
      ...prev,
      priceRange: prev.priceRange === range ? '' : range
    }))
  }

  const handlePrescriptionFilter = (value) => {
    setFilters(prev => ({
      ...prev,
      prescriptionRequired: prev.prescriptionRequired === value ? null : value
    }))
  }

  const handleDosageFormChange = (form, checked) => {
    setFilters(prev => ({
      ...prev,
      dosageForms: checked 
        ? [...prev.dosageForms, form]
        : prev.dosageForms.filter(f => f !== form)
    }))
  }

  const handleActiveIngredientChange = (ingredient, checked) => {
    setFilters(prev => ({
      ...prev,
      activeIngredients: checked 
        ? [...prev.activeIngredients, ingredient]
        : prev.activeIngredients.filter(i => i !== ingredient)
    }))
  }

  const handleExpiryRangeChange = (range) => {
    setFilters(prev => ({
      ...prev,
      expiryRange: prev.expiryRange === range ? '' : range
    }))
  }

  const handleStockRangeChange = (range) => {
    setFilters(prev => ({
      ...prev,
      stockRange: prev.stockRange === range ? '' : range
    }))
  }

  const handleAddToCart = async (product) => {
    try {
      const cartItem = {
        productId: product.id || product.sku,
        quantity: 1,
        unitPrice: product.currentPrice || product.mrp
      }
      
      await apiRequest('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify(cartItem)
      })
      
      showMessage(`${product.name} added to cart`, 'success')
    } catch (error) {
      console.error('Failed to add to cart:', error)
      showMessage('Failed to add to cart', 'error')
    }
  }

  const handleViewDetails = (product) => {
    // Navigate to product details page using React Router with product ID
    navigate(`/products/${product.id}`)
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(''), 3000)
  }

  const toggleCategoryExpansion = async (categoryId) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
      // Fetch sub-categories if not already loaded
      const subCategories = categories.filter(cat => cat.parentId === categoryId)
      if (subCategories.length === 0) {
        try {
          const response = await apiRequest(`/api/categories/${categoryId}/subcategories`)
          setCategories(prev => [...prev, ...response])
        } catch (error) {
          console.error('Failed to fetch sub-categories:', error)
        }
      }
    }
    setExpandedCategories(newExpanded)
  }

  const toggleBrandExpansion = async (brandId) => {
    const newExpanded = new Set(expandedBrands)
    if (newExpanded.has(brandId)) {
      newExpanded.delete(brandId)
    } else {
      newExpanded.add(brandId)
      // Fetch sub-brands if not already loaded
      const subBrands = brands.filter(brand => brand.parentId === brandId)
      if (subBrands.length === 0) {
        try {
          const response = await apiRequest(`/api/brands/${brandId}/subbrands`)
          setBrands(prev => [...prev, ...response])
        } catch (error) {
          console.error('Failed to fetch sub-brands:', error)
        }
      }
    }
    setExpandedBrands(newExpanded)
  }

  const clearFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      categoryTypes: [],
      brandTypes: [],
      priceRange: '',
      prescriptionRequired: null,
      dosageForms: [],
      activeIngredients: [],
      expiryRange: '',
      stockRange: '',
      inStock: true
    })
  }

  const closeFilters = () => {
    setShowFilters(false)
  }

  const handleAddToWishlist = (product) => {
    const token = localStorage.getItem('token')
    if (!token) {
      showMessage('Please login to use wishlist', 'error')
      return
    }

    const isInWishlist = wishlist.some(item => item.id === product.id)

    if (isInWishlist) {
      apiRequest(`/api/wishlist/${product.id}`, { method: 'DELETE' })
        .then(() => {
          setWishlist(prev => prev.filter(item => item.id !== product.id))
          showMessage('Removed from wishlist', 'success')
        })
        .catch((error) => {
          console.error('Failed to remove from wishlist:', error)
          showMessage('Failed to update wishlist', 'error')
        })
      return
    }

    apiRequest('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id })
    })
      .then(() => {
        setWishlist(prev => [...prev, product])
        showMessage('Added to wishlist', 'success')
      })
      .catch((error) => {
        console.error('Failed to add to wishlist:', error)
        showMessage('Failed to update wishlist', 'error')
      })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
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
        <h2>Medicine Catalogue</h2>
        <div className="catalogue-controls">
          <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
            <span className="filter-icon">☰</span> Filters
            {Object.values(filters).some(val => 
              Array.isArray(val) ? val.length > 0 : val !== null && val !== ''
            ) && <span className="filter-indicator">•</span>}
          </button>
          <div className="sort">
            <label>Sort: 
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="catalogue-wrapper">
        {/* Filter overlay for mobile */}
        {showFilters && <div className="filter-overlay active" onClick={closeFilters}></div>}
        
        <aside className={`catalogue-filters ${showFilters ? 'open' : 'closed'}`}>
          <div className="filters-header">
            <h3>Filters</h3>
            <button className="close-filters-btn" onClick={() => setShowFilters(false)}>✕</button>
          </div>

          {/* Categories */}
          <div className="filter-section">
            <h3>Categories</h3>
            {rootCategories.map(category => (
              <div key={category.id} className="hierarchical-filter-item">
                <div className="filter-item-header">
                  <input 
                    type="checkbox" 
                    id={`category-${category.id}`}
                    checked={filters.categories.includes(category.id)}
                    onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                  />
                  <label htmlFor={`category-${category.id}`} className="filter-label">
                    {category.name}
                  </label>
                  {categories.some(cat => cat.parentId === category.id) && (
                    <button 
                      className="expand-btn"
                      onClick={() => toggleCategoryExpansion(category.id)}
                    >
                      {expandedCategories.has(category.id) ? '−' : '+'}
                    </button>
                  )}
                </div>
                {expandedCategories.has(category.id) && (
                  <div className="sub-filters">
                    {categories
                      .filter(cat => cat.parentId === category.id)
                      .map(subCategory => (
                        <div key={subCategory.id} className="filter-item sub-filter">
                          <input 
                            type="checkbox" 
                            id={`category-${subCategory.id}`}
                            checked={filters.categories.includes(subCategory.id)}
                            onChange={(e) => handleCategoryChange(subCategory.id, e.target.checked)}
                          />
                          <label htmlFor={`category-${subCategory.id}`}>
                            {subCategory.name}
                          </label>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Category Type Options */}
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="category-type-medicine"
                checked={filters.categoryTypes.includes('MEDICINE')}
                onChange={(e) => handleCategoryTypeChange('MEDICINE', e.target.checked)}
              />
              <label htmlFor="category-type-medicine">Medicine</label>
            </div>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="category-type-supplement"
                checked={filters.categoryTypes.includes('SUPPLEMENT')}
                onChange={(e) => handleCategoryTypeChange('SUPPLEMENT', e.target.checked)}
              />
              <label htmlFor="category-type-supplement">Health Supplement</label>
            </div>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="category-type-personal-care"
                checked={filters.categoryTypes.includes('PERSONAL_CARE')}
                onChange={(e) => handleCategoryTypeChange('PERSONAL_CARE', e.target.checked)}
              />
              <label htmlFor="category-type-personal-care">Personal Care</label>
            </div>
          </div>

          {/* Brands */}
          <div className="filter-section">
            <h3>Brands</h3>
            {rootBrands.map(brand => (
              <div key={brand.id} className="hierarchical-filter-item">
                <div className="filter-item-header">
                  <input 
                    type="checkbox" 
                    id={`brand-${brand.id}`}
                    checked={filters.brands.includes(brand.id)}
                    onChange={(e) => handleBrandChange(brand.id, e.target.checked)}
                  />
                  <label htmlFor={`brand-${brand.id}`} className="filter-label">
                    {brand.name}
                  </label>
                  {brands.some(b => b.parentId === brand.id) && (
                    <button 
                      className="expand-btn"
                      onClick={() => toggleBrandExpansion(brand.id)}
                    >
                      {expandedBrands.has(brand.id) ? '−' : '+'}
                    </button>
                  )}
                </div>
                {expandedBrands.has(brand.id) && (
                  <div className="sub-filters">
                    {brands
                      .filter(b => b.parentId === brand.id)
                      .map(subBrand => (
                        <div key={subBrand.id} className="filter-item sub-filter">
                          <input 
                            type="checkbox" 
                            id={`brand-${subBrand.id}`}
                            checked={filters.brands.includes(subBrand.id)}
                            onChange={(e) => handleBrandChange(subBrand.id, e.target.checked)}
                          />
                          <label htmlFor={`brand-${subBrand.id}`}>
                            {subBrand.name}
                          </label>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Brand Type Options */}
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="brand-type-manufacturer"
                checked={filters.brandTypes.includes('MANUFACTURER')}
                onChange={(e) => handleBrandTypeChange('MANUFACTURER', e.target.checked)}
              />
              <label htmlFor="brand-type-manufacturer">Manufacturer</label>
            </div>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="brand-type-distributor"
                checked={filters.brandTypes.includes('DISTRIBUTOR')}
                onChange={(e) => handleBrandTypeChange('DISTRIBUTOR', e.target.checked)}
              />
              <label htmlFor="brand-type-distributor">Distributor</label>
            </div>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="brand-type-generic"
                checked={filters.brandTypes.includes('GENERIC')}
                onChange={(e) => handleBrandTypeChange('GENERIC', e.target.checked)}
              />
              <label htmlFor="brand-type-generic">Generic</label>
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="price-0-100"
                checked={filters.priceRange === '0-100'}
                onChange={() => handlePriceRangeChange('0-100')}
              />
              <label htmlFor="price-0-100">Under ₹100</label>
            </div>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="price-100-500"
                checked={filters.priceRange === '100-500'}
                onChange={() => handlePriceRangeChange('100-500')}
              />
              <label htmlFor="price-100-500">₹100 - ₹500</label>
            </div>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="price-500-1000"
                checked={filters.priceRange === '500-1000'}
                onChange={() => handlePriceRangeChange('500-1000')}
              />
              <label htmlFor="price-500-1000">₹500 - ₹1000</label>
            </div>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="price-1000+"
                checked={filters.priceRange === '1000-'}
                onChange={() => handlePriceRangeChange('1000-')}
              />
              <label htmlFor="price-1000+">Above ₹1000</label>
            </div>
          </div>

          {/* Prescription Required */}
          <div className="filter-section">
            <h3>Prescription</h3>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="prescription-yes"
                checked={filters.prescriptionRequired === true}
                onChange={() => handlePrescriptionFilter(true)}
              />
              <label htmlFor="prescription-yes">Prescription Required</label>
            </div>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="prescription-no"
                checked={filters.prescriptionRequired === false}
                onChange={() => handlePrescriptionFilter(false)}
              />
              <label htmlFor="prescription-no">No Prescription Required</label>
            </div>
          </div>

          {/* Dosage Forms */}
          <div className="filter-section">
            <h3>Dosage Form</h3>
            {dosageForms.map(form => (
              <div key={form} className="filter-item">
                <input 
                  type="checkbox" 
                  id={`dosage-${form}`}
                  checked={filters.dosageForms.includes(form)}
                  onChange={(e) => handleDosageFormChange(form, e.target.checked)}
                />
                <label htmlFor={`dosage-${form}`}>{form}</label>
              </div>
            ))}
          </div>

          {/* Active Ingredients */}
          <div className="filter-section">
            <h3>Active Ingredient</h3>
            {activeIngredients.map(ingredient => (
              <div key={ingredient} className="filter-item">
                <input 
                  type="checkbox" 
                  id={`ingredient-${ingredient}`}
                  checked={filters.activeIngredients.includes(ingredient)}
                  onChange={(e) => handleActiveIngredientChange(ingredient, e.target.checked)}
                />
                <label htmlFor={`ingredient-${ingredient}`}>{ingredient}</label>
              </div>
            ))}
          </div>

          {/* Stock Range */}
          <div className="filter-section">
            <h3>Stock Range</h3>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="stock-0-10"
                checked={filters.stockRange === '0-10'}
                onChange={() => handleStockRangeChange('0-10')}
              />
              <label htmlFor="stock-0-10">0-10 units</label>
            </div>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="stock-10-50"
                checked={filters.stockRange === '10-50'}
                onChange={() => handleStockRangeChange('10-50')}
              />
              <label htmlFor="stock-10-50">10-50 units</label>
            </div>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="stock-50+"
                checked={filters.stockRange === '50-'}
                onChange={() => handleStockRangeChange('50-')}
              />
              <label htmlFor="stock-50+">50+ units</label>
            </div>
          </div>

          {/* Expiry Range */}
          <div className="filter-section">
            <h3>Expiry</h3>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="expiry-30"
                checked={filters.expiryRange === '30'}
                onChange={() => handleExpiryRangeChange('30')}
              />
              <label htmlFor="expiry-30">Expiring in 30 days</label>
            </div>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="expiry-90"
                checked={filters.expiryRange === '90'}
                onChange={() => handleExpiryRangeChange('90')}
              />
              <label htmlFor="expiry-90">Expiring in 90 days</label>
            </div>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="expiry-180+"
                checked={filters.expiryRange === '180+'}
                onChange={() => handleExpiryRangeChange('180+')}
              />
              <label htmlFor="expiry-180+">Expiring in 6+ months</label>
            </div>
          </div>

          {/* Availability */}
          <div className="filter-section">
            <h3>Availability</h3>
            <div className="filter-item">
              <input 
                type="checkbox" 
                id="in-stock"
                checked={filters.inStock}
                onChange={(e) => setFilters(prev => ({...prev, inStock: e.target.checked}))}
              />
              <label htmlFor="in-stock">In Stock Only</label>
            </div>
          </div>

          {/* Clear Filters */}
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </aside>

        <div className="products-section">
          {loading ? (
            <div className="loading-spinner">Loading products...</div>
          ) : (
            <>
              <div className="products-count">
                Showing {products.length} products
              </div>
              <div className="products-grid">
                {products.map(product => (
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
                      {!product.inStock && (
                        <div className="out-of-stock-overlay">
                          <span>Out of Stock</span>
                        </div>
                      )}
                      <button 
                        className={`wishlist-btn ${wishlist.some(item => item.id === product.id) ? 'active' : ''}`}
                        onClick={() => handleAddToWishlist(product)}
                        title="Add to Wishlist"
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
                          onClick={() => handleViewDetails(product)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {products.length === 0 && (
                <div className="no-products">
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or search terms</p>
                  <button onClick={clearFilters}>Clear Filters</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CataloguePage
