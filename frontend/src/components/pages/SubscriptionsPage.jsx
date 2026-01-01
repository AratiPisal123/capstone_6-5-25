function SubscriptionsPage() {
  return (
    <div className="subscriptions-page">
      <div className="subscriptions-header">
        <h2>Subscriptions</h2>
        <p className="breadcrumb">Home <span>&gt;</span> Subscriptions</p>
      </div>

      <div className="subscription-tabs">
        <button className="tab-btn active" style={{ backgroundColor: '#FFC107', color: '#333' }}>Diabetes</button>
        <button className="tab-btn" style={{ backgroundColor: '#4CAF50', color: 'white' }}>Wellness</button>
        <button className="tab-btn" style={{ backgroundColor: '#E91E63', color: 'white' }}>Heart Care</button>
        <button className="tab-btn" style={{ backgroundColor: '#9C27B0', color: 'white' }}>Skin Care</button>
        <button className="tab-btn" style={{ backgroundColor: '#2196F3', color: 'white' }}>Immunity</button>
        <button className="tab-btn add-tab">+</button>
      </div>

      <div className="subscriptions-wrapper">
        {/* Left Column - Create Subscription */}
        <div className="create-subscription">
          <h3 className="section-heading">Create subscription</h3>
          
          <div className="subscription-info">
            <div className="info-row">
              <span className="info-label">Add to Subscription</span>
              <span className="info-price">$18</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Frequency</label>
            <div className="frequency-wrapper">
              <select className="frequency-select">
                <option>Monthly</option>
                <option>Bi-weekly</option>
                <option>Quarterly</option>
              </select>
              <button className="add-subscription-btn">Add to Subscription</button>
            </div>
          </div>

          <div className="product-table">
            <div className="table-header">
              <span className="col-name">Product name</span>
              <span className="col-price">Price</span>
              <span className="col-quantity">Quantity</span>
            </div>
            <div className="table-row">
              <span className="col-name">Aspirin</span>
              <span className="col-price">$18</span>
              <span className="col-quantity">1</span>
            </div>
          </div>

          <div className="subscription-actions">
            <button className="save-subscription-btn">Save Subscription</button>
            <button className="cancel-btn">Cancel</button>
          </div>
        </div>

        {/* Right Column - Active Subscriptions */}
        <div className="active-subscriptions">
          <h3 className="section-heading">Active subscriptions</h3>
          
          <div className="subscription-item">
            <div className="subscription-header">
              <span className="subscription-name">BP-Care</span>
              <span className="next-date">Next 12 Dec</span>
            </div>
            <div className="subscription-buttons">
              <button className="pause-btn">Pause</button>
              <button className="skip-btn">Skip Next</button>
              <button className="cancel-subscription-btn">Cancel</button>
            </div>
          </div>

          <div className="subscription-item">
            <div className="subscription-header">
              <span className="subscription-name">Wellness</span>
              <span className="next-date">Next 12 Dec</span>
            </div>
            <div className="subscription-buttons">
              <button className="pause-btn">Pause</button>
              <button className="skip-btn">Skip Next</button>
              <button className="cancel-subscription-btn">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionsPage
