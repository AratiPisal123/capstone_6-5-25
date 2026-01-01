function OrderDetailsPage() {
  return (
    <div className="order-details-page">
      <h2>Order #101 Details</h2>
      
      <div className="order-details-wrapper">
        <div className="order-info-section">
          <h3>Order #101</h3>
          <p>April 20</p>
          <p>3 items <strong>$37.97</strong></p>
          
          <h4>Payment method</h4>
          <p>Credit Card</p>
          
          <h4>Delivery address</h4>
          <p>123 Main St, City St, 12345</p>
        </div>

        <div className="order-timeline-section">
          <div className="timeline">
            <div className="timeline-item active">
              <div className="timeline-dot"></div>
              <p>Order placed</p>
            </div>
            <div className="timeline-item active">
              <div className="timeline-dot"></div>
              <p>Packed</p>
            </div>
            <div className="timeline-item active">
              <div className="timeline-dot"></div>
              <p>Shipped</p>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <p>Out for delivery</p>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <p>Delivered</p>
            </div>
          </div>
          <p className="estimated-delivery">Estimated delivery: April 25</p>
        </div>
      </div>

      <div className="order-products">
        <div className="product-item">
          <p className="product-name">Product name</p>
          <p className="product-qty">Quantity: 1</p>
          <p className="product-detail">Prescription uploaded</p>
          <p className="product-price">$37.97</p>
        </div>
        <div className="product-item">
          <p className="product-name">Product name</p>
          <p className="product-qty">Quantity: 1</p>
          <p className="product-detail">Prescription uploaded</p>
          <p className="product-price">$3449</p>
        </div>
      </div>

      <div className="order-actions">
        <button className="action-btn">Download Invoice</button>
        <button className="action-btn">Repeat order</button>
        <button className="action-btn cancel">Cancel order</button>
      </div>

      <div className="order-footer">
        <p>Courier: <a href="#">Deliveys</a></p>
        <p>Tracking number: 1234667590</p>
      </div>
    </div>
  )
}

export default OrderDetailsPage
