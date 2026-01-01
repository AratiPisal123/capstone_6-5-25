function OrderConfirmationPage() {
  return (
    <div className="order-confirmation-page">
      <div className="confirmation-header">
        <div className="success-icon">✓</div>
        <h2>Order Placed Successfully!</h2>
      </div>

      <div className="confirmation-content">
        <div className="order-summary-box">
          <h3>Order ID</h3>
          <p>#102</p>
          <p>April 25</p>

          <h3>Total</h3>
          <p>••••••••</p>

          <h3>Delivery Address</h3>
          <p>123 Main St, City St, 12345</p>
        </div>

        <div className="timeline-section">
          <div className="timeline-horizontal">
            <div className="timeline-step completed">
              <div className="step-dot"></div>
              <p>Order Placed</p>
            </div>
            <div className="timeline-step">
              <div className="step-dot"></div>
              <p>Packed</p>
            </div>
            <div className="timeline-step">
              <div className="step-dot"></div>
              <p>Shipped</p>
            </div>
            <div className="timeline-step">
              <div className="step-dot"></div>
              <p>Out for delivery</p>
            </div>
            <div className="timeline-step">
              <div className="step-dot"></div>
              <p>Delivered</p>
            </div>
          </div>
        </div>
      </div>

      <div className="order-products-confirmation">
        <div className="confirmation-product">
          <h3>Product name</h3>
          <p>Quantity: 1</p>
          <p>Prescription uploaded</p>
          <p className="product-price">$37.97</p>
          <p className="estimated">Estimated delivery: April 30</p>
        </div>
        <div className="confirmation-product">
          <h3>Product name</h3>
          <p>Quantity: 1</p>
          <p>Prescription uploaded</p>
          <p className="product-price">$40.97</p>
        </div>
      </div>

      <div className="confirmation-actions">
        <button className="track-order-btn">Track order</button>
        <button className="download-invoice-btn">Download invoice</button>
        <button className="cancel-order-btn">Cancel order</button>
      </div>

      <div className="tracking-info">
        <p>Courier: DHL</p>
        <p>Tracking number: 1234567890</p>
      </div>
    </div>
  )
}

export default OrderConfirmationPage
