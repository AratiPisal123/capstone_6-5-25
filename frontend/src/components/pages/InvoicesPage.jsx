function InvoicesPage() {
  return (
    <div className="invoices-page">
      <div className="invoices-header">
        <h2>Invoices</h2>
        <button className="print-btn">🖨️ Print</button>
      </div>

      <p className="breadcrumb"><a href="#">Home</a>  Invoices</p>

      <div className="invoice-content">
        <div className="invoice-seller">
          <h3>Seller</h3>
          <p>Seller Name Inc.</p>
          <p>123 Seller Street</p>
          <p>Seller City, SE 12345</p>
          <p>seller@example.com</p>
        </div>

        <div className="invoice-buyer">
          <h3>Buyer</h3>
          <p>Buyer Name LLC</p>
          <p>455 Buyer Avenue</p>
          <p>Buyer Town, BY 67890</p>
          <p>buyer@example.com</p>
        </div>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>PRODUCT</th>
            <th>QTY</th>
            <th>PRICE</th>
            <th>TAXES</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Product A</td>
            <td>2</td>
            <td>$100.00</td>
            <td>$10.00</td>
            <td>$210.00</td>
          </tr>
          <tr>
            <td>Product B</td>
            <td>1</td>
            <td>$50.00</td>
            <td>$5.00</td>
            <td>$55.00</td>
          </tr>
          <tr>
            <td>Product C</td>
            <td>3</td>
            <td>$20.00</td>
            <td>$5.00</td>
            <td>$66.00</td>
          </tr>
        </tbody>
      </table>

      <div className="invoice-totals">
        <p>Subtotal: $310.00</p>
        <p>Tax (10%): $31.00</p>
        <h3>Total: $341.00</h3>
      </div>

      <div className="invoice-notes">
        <h3>Notes</h3>
        <p>Prescription ID: RX123456789</p>
        <p>Return Policy: Items can be returned within 30 days of purchase with original receipt. Some exclusions may apply.</p>
      </div>
    </div>
  )
}

export default InvoicesPage
