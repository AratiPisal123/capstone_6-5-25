function WishlistPage() {
  const wishlistItems = [
    { id: 1, name: 'Product name', price: '$24.99', stock: 'In stock' },
    { id: 2, name: 'Product name', price: '$24.99', stock: 'In stock' },
    { id: 3, name: 'Product name', price: '$24.99', stock: 'In stock' },
    { id: 4, name: 'Product name', price: '$24.99', stock: 'In stock' },
    { id: 5, name: 'Product name', price: '$24.99', stock: 'In stock' },
    { id: 6, name: 'Product name', price: '$24.99', stock: 'In stock' }
  ]

  return (
    <div className="wishlist-page">
      <h2>Wishlist</h2>
      <div className="wishlist-grid">
        {wishlistItems.map(item => (
          <div key={item.id} className="wishlist-card">
            <div className="wishlist-image"></div>
            <h3>{item.name}</h3>
            <p className="wishlist-price">{item.price}</p>
            <p className="wishlist-stock">• {item.stock}</p>
            <button className="add-to-cart-btn">Add to cart</button>
            <button className="remove-btn">Remove</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WishlistPage
