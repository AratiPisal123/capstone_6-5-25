import { useState } from 'react'

function CataloguePage() {
  const [showFilters, setShowFilters] = useState(false)

  const products = [
    { id: 1, name: 'Product name', price: 'USD 24.99', stock: 'In stock', hasRx: true },
    { id: 2, name: 'Product name', price: 'USD 24.99', stock: 'In stock', hasRx: false },
    { id: 3, name: 'Product name', price: 'USD 24.99', stock: 'In stock', hasRx: true },
    { id: 4, name: 'Product name', price: 'USD 24.99', stock: 'In stock', hasRx: false },
    { id: 5, name: 'Product name', price: 'USD 24.99', stock: 'In stock', hasRx: true },
    { id: 6, name: 'Product name', price: 'USD 24.99', stock: 'In stock', hasRx: false }
  ]

  const closeFilters = () => {
    setShowFilters(false)
  }

  return (
    <div className="catalogue-page">
      <h2>Catalogue</h2>
      <div className="catalogue-controls">
        <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
          <span className="filter-icon">☰</span> Filters
        </button>
        <div className="sort">
          <label>Sort: <select><option>Popularity</option></select></label>
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

          <h3>Category</h3>
          <div className="filter-item">
            <input type="checkbox" id="vitamins" />
            <label htmlFor="vitamins">Vitamins</label>
          </div>
          <div className="filter-item">
            <input type="checkbox" id="pain-relief" />
            <label htmlFor="pain-relief">Pain Relief</label>
          </div>
          <div className="filter-item">
            <input type="checkbox" id="diabetes" />
            <label htmlFor="diabetes">Diabetes</label>
          </div>

          <h3>Brand</h3>
          <div className="filter-item">
            <input type="checkbox" id="brand-a" />
            <label htmlFor="brand-a">Brans A</label>
          </div>
          <div className="filter-item">
            <input type="checkbox" id="brand-b" />
            <label htmlFor="brand-b">Brand B</label>
          </div>

          <h3>Price</h3>
          <div className="filter-item">
            <input type="checkbox" id="price-10" />
            <label htmlFor="price-10">USD +10</label>
          </div>
          <div className="filter-item">
            <input type="checkbox" id="price-49" />
            <label htmlFor="price-49">USD 10-49</label>
          </div>
        </aside>

        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card-catalogue">
              <div className="product-card-image"></div>
              <div className="product-card-content">
                <div className="product-header">
                  <h3>{product.name}</h3>
                  {product.hasRx && <span className="rx-badge">Rx</span>}
                </div>
                <p className="product-price-stock">{product.price} • {product.stock}</p>
                <div className="product-actions">
                  <button className="add-to-cart-btn">Add to cart</button>
                  <button className="details-btn">Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CataloguePage
