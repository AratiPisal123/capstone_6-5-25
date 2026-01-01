function ShoppingCartPage() {
  const cartItems = [
    { name: 'Product name', price: '$29.99', qty: 1, prescription: true, inStock: true },
    { name: 'Product name', price: '$2.99', qty: 1, prescription: true, inStock: true },
    { name: 'Product name', price: '$59.99', qty: 1, prescription: false, inStock: true },
    { name: 'Product name', price: '$59.99', qty: 1, prescription: true, inStock: true }
  ]

  return (
    <div className="shopping-cart-page">
      <h2>Shopping Cart</h2>

      <div className="cart-wrapper">
        <div className="cart-items">
          {cartItems.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="item-image"></div>
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-price">{item.price}</p>
                <p className="item-stock">• In stock</p>
                {item.prescription && <p className="prescription-required">📋 Prescription required</p>}
              </div>
              <div className="item-qty">
                <button>−</button>
                <span>{item.qty}</span>
                <button>+</button>
              </div>
              <p className="item-total">{item.price}</p>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order summary</h3>
          <p className="summary-line">Subtotal <span>$94.97</span></p>
          <p className="summary-line">Tax <span>$3.50</span></p>
          <h3 className="summary-total">Total <span>$108.47</span></h3>

          <div className="prescription-upload">
            <p className="upload-label">Upload prescription <span className="required">*</span></p>
            <button className="file-input-btn">Choose file <span>No file chosen</span></button>
          </div>

          <button className="verify-btn">🔐 Verify Prescription</button>
          <button className="checkout-btn">🛒 Checkout</button>
          <a href="#" className="continue-shopping">Continue shopping</a>
        </div>
      </div>
    </div>
  )
}

export default ShoppingCartPage
