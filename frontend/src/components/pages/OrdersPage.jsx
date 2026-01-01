function OrdersPage() {
  const orders = [
    { id: '#101', date: '12 Dec', items: '2 items', amount: '$249', status: 'Shipped' },
    { id: '#102', date: '12 Dec', items: '2 items', amount: '$249', status: 'Shipped' },
    { id: '#103', date: '12 Dec', items: '2 items', amount: '$249', status: 'Shipped' },
    { id: '#104', date: '12 Dec', items: '2 items', amount: '$249', status: 'Shipped' },
    { id: '#105', date: '12 Dec', items: '2 items', amount: '$249', status: 'Shipped' }
  ]

  return (
    <div className="orders-page">
      <h2>Orders</h2>
      <div className="orders-controls">
        <select className="status-filter">
          <option>Status: All</option>
        </select>
        <select className="date-filter">
          <option>Date: Select</option>
        </select>
        <input type="text" placeholder="Search Order ID" className="search-order" />
      </div>

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>DATE</th>
              <th>ITEMS</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.date}</td>
                <td>{order.items}</td>
                <td>{order.amount}</td>
                <td>{order.status}</td>
                <td>
                  <button className="action-btn">Track</button>
                  <button className="action-btn">Repeat</button>
                  <button className="action-btn">Invoice</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>‹ Prev</span>
        <span>1</span>
        <span>2</span>
        <span>Next ›</span>
      </div>
    </div>
  )
}

export default OrdersPage
