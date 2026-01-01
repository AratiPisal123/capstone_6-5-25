function OrderTrackingPage() {
  const orders = [
    { id: '#101', date: 'April 20', items: '3 items', amount: '$37.97', status: 'In Transit' },
    { id: '#100', date: 'April 20', items: '2 items', amount: '$34.48', status: 'Delivered' },
    { id: '#099', date: 'April 18', items: '1 item', amount: '$12.50', status: 'Delivered', note: 'Delivery on April 21' }
  ]

  return (
    <div className="order-tracking-page">
      <h2>Track Your Orders</h2>
      
      <div className="tracking-controls">
        <input type="text" placeholder="Search order ID" className="search-input" />
        <button className="status-btn active">All</button>
        <button className="status-btn">In Transit</button>
        <button className="status-btn">Delivered</button>
        <button className="status-btn">Canceled</button>
      </div>

      <div className="tracking-items">
        {orders.map((order, index) => (
          <div key={index} className="tracking-item">
            <div className="tracking-left">
              <h3>{order.id}</h3>
              <p>{order.date}</p>
              <p>{order.items} of {order.amount}</p>
            </div>
            <div className="tracking-middle">
              <div className="status-timeline">
                <div className="timeline-dot active"></div>
                <span>Order placed</span>
                <div className="timeline-line"></div>
                <div className="timeline-dot active"></div>
                <span>Shipped or delivery</span>
                <div className="timeline-line"></div>
                <div className="timeline-dot"></div>
                <span>Out deliver</span>
              </div>
            </div>
            <div className="tracking-right">
              <p className="status">{order.status}</p>
              <button className="track-btn">Track order</button>
              <button className="repeat-btn">Repeat now</button>
              {order.note && <p className="note">{order.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderTrackingPage
