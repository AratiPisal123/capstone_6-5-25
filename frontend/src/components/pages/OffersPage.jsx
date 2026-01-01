function OffersPage() {
  return (
    <div className="offers-page">
      <h2>Offers</h2>

      <div className="main-offer">
        <h3>Flat 25% off on Vitamins</h3>
        <button className="shop-now-btn">Shop now</button>
      </div>

      <div className="offers-grid">
        <div className="offer-card">
          <h3>Buy 1 Get 1 Free</h3>
          <p>Mix and match any eligible products Valid until April 30</p>
          <button className="apply-offer-btn">Apply offer</button>
        </div>
        <div className="offer-card">
          <h3>20% off Wellness products</h3>
          <p>Save on healthcare essentials Valid until May 15</p>
          <button className="shop-now-btn">Shop now</button>
        </div>
        <div className="offer-card">
          <h3>Top Deal Today</h3>
          <p>₹150 off on orders over ₹1000</p>
          <p className="enjoy">Enjoy Instant savings</p>
          <button className="shop-now-btn">Shop now</button>
        </div>
      </div>

      <h3>Special Coupons</h3>
      <div className="coupons-grid">
        <div className="coupon-card">
          <p className="coupon-code">SAVE20</p>
          <p className="expiry">Expires on May 10</p>
          <button className="copy-btn">Copy code</button>
        </div>
        <div className="coupon-card">
          <p className="coupon-code">FREESHIP</p>
          <p className="expiry">Expires May 31</p>
          <button className="copy-btn">Copy code</button>
        </div>
      </div>
    </div>
  )
}

export default OffersPage
