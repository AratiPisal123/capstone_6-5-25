function CheckoutPage() {
  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <div className="checkout-wrapper">
        <div className="checkout-form">
          <div className="checkout-product-list">
            <div className="checkout-product">
              <div className="product-img"></div>
              <div className="product-info">
                <h3>Hyluoric Acid</h3>
                <p>Quantity: 1</p>
                <p className="rx-note">Prescription uploaded</p>
              </div>
              <p className="product-amount">$37.97</p>
            </div>
            <div className="checkout-product">
              <div className="product-img"></div>
              <div className="product-info">
                <h3>Aspirin</h3>
                <p>Quantity: 1</p>
                <p className="rx-note">Prescription uploaded</p>
              </div>
              <p className="product-amount">$37.97</p>
            </div>
          </div>

          <div className="delivery-section">
            <h3>Delivery Address</h3>
            <p>123 Main St, City lb, 12345</p>
            <a href="#" className="change-address">Change address</a>
          </div>

          <div className="payment-section">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <label className="payment-option">
                <input type="radio" name="payment" checked />
                Credit/Debit Card
              </label>
              <label className="payment-option">
                <input type="radio" name="payment" />
                Net Banking
              </label>
            </div>

            <p className="card-label">Card number</p>
            <input type="text" placeholder="Card number" className="card-input" />

            <div className="card-details">
              <input type="text" placeholder="Expiry date" className="card-input-small" />
              <input type="text" placeholder="C-VV" className="card-input-small" />
            </div>
          </div>

          <div className="checkout-actions">
            <button className="place-order-btn">Place order</button>
            <button className="cancel-checkout-btn">Cancel</button>
          </div>
        </div>

        <aside className="order-summary-sidebar">
          <h3>Order Summary</h3>
          <p className="summary-item">Subtotal <span>$34.97</span></p>
          <p className="summary-item">Tax <span>$8.50</span></p>
          <p className="summary-item">Shipping <span>$5.00</span></p>
          <h3 className="summary-total">Total <span>$108.47</span></h3>

          <div className="promo-code">
            <h4>Enter promo code</h4>
            <input type="text" placeholder="Enter promo code" />
            <button>Apply</button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CheckoutPage
