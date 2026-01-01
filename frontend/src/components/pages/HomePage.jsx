function HomePage() {
  return (
    <div className="home-page">
      <h2>Dashboard</h2>
      <p>Welcome back! Here's a quick snapshot.</p>

      <div className="banners-section">
        <div className="banner">Pharmacy</div>
        <div className="banner">Healthcare</div>
        <div className="banner">Medicines Up To 70% OFF</div>
        <div className="banner">Medicines Up To 70% OFF</div>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <h3>Orders in Transit</h3>
          <p className="stat-value">2</p>
          <p className="stat-detail">Expected Delivery: Tomorrow</p>
          <span className="stat-arrow">›</span>
        </div>
        <div className="stat-card">
          <h3>Active Subscriptions</h3>
          <p className="stat-value">3</p>
          <span className="stat-arrow">›</span>
        </div>
        <div className="stat-card">
          <h3>Board Prescription</h3>
          <p className="stat-value">3</p>
          <span className="stat-arrow">›</span>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick actions</h3>
        <div className="action-buttons">
          <button>Shop by Concern</button>
          <button>Shop by Category</button>
        </div>
      </div>

      <div className="bottom-section">
        <div className="recent-orders">
          <h3>Recent orders</h3>
          <div className="order-item">
            <div className="order-info">
              <p>Order #6063 - Oct 3+20211</p>
              <p>Other ₹ 0.01 · Done now</p>
            </div>
            <button className="add-to-cart-btn">Add to Cart</button>
          </div>
          <div className="order-item">
            <div className="order-info">
              <p>Order #6063 - Oct 3+20211</p>
              <p>Other ₹ 0.01 · Done now</p>
            </div>
            <button className="add-to-cart-btn">Add to Cart</button>
          </div>
        </div>

        <div className="recommended">
          <h3>Recommended for you</h3>
          <div className="product-grid">
            <div className="product-card">
              <div className="product-image"></div>
              <div className="product-info">
                <p>Product name</p>
                <p>Product count</p>
              </div>
            </div>
            <div className="product-card">
              <div className="product-image"></div>
              <div className="product-info">
                <p>Product name</p>
                <p>Product count</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <a href="#">About Us</a>
        <a href="#">Terms and Conditions</a>
        <a href="#">Privacy Policy</a>
        <span>@Medbudy 2025</span>
      </div>
    </div>
  )
}

export default HomePage
