import { useState, useEffect } from 'react'
import { apiRequest } from '../../utils/api'

function AddressesPage() {
  const [addresses, setAddresses] = useState([])
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: '',
    type: 'HOME',
    isDefault: false
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const data = await apiRequest('/addresses')
      setAddresses(data || [])
    } catch (err) {
      console.error('Failed to fetch addresses:', err)
    }
  }

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleEditAddressChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditingAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const addressData = {
        ...newAddress,
        isDefault: newAddress.isDefault
      }
      await apiRequest('/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData)
      })
      setShowAddAddress(false)
      setNewAddress({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        phone: '',
        type: 'HOME',
        isDefault: false
      })
      fetchAddresses()
      setMessage('Address added successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.message || 'Failed to add address')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return
    try {
      await apiRequest(`/addresses/${addressId}`, {
        method: 'DELETE'
      })
      fetchAddresses()
      setMessage('Address deleted successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.message || 'Failed to delete address')
    }
  }

  const handleEditAddress = (address) => {
    setEditingAddress({ ...address })
  }

  const handleUpdateAddress = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await apiRequest(`/addresses/${editingAddress.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingAddress)
      })
      setEditingAddress(null)
      fetchAddresses()
      setMessage('Address updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.message || 'Failed to update address')
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await apiRequest(`/addresses/${addressId}/default`, {
        method: 'POST'
      })
      fetchAddresses()
      setMessage('Default address updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.message || 'Failed to set default address')
    }
  }

  const handleCancelEdit = () => {
    setEditingAddress(null)
  }

  return (
    <div className="addresses-page">
      <div className="addresses-header">
        <h2>Manage addresses</h2>
        <button 
          className="add-address-btn" 
          onClick={() => setShowAddAddress(!showAddAddress)}
        >
          {showAddAddress ? '− Cancel' : '+ Add new address'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Add Address Form */}
      {showAddAddress && (
        <div className="add-address-form-container">
          <div className="add-address-form">
            <h3 className="form-title">Add New Address</h3>
            <form onSubmit={handleAddAddress}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={newAddress.fullName}
                    onChange={handleAddressChange}
                    className="form-input"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Address Line 1</label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={newAddress.addressLine1}
                    onChange={handleAddressChange}
                    className="form-input"
                    placeholder="Street address, P.O. box"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Address Line 2</label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={newAddress.addressLine2}
                    onChange={handleAddressChange}
                    className="form-input"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>
              </div>

              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    value={newAddress.city}
                    onChange={handleAddressChange}
                    className="form-input"
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    value={newAddress.state}
                    onChange={handleAddressChange}
                    className="form-input"
                    placeholder="Enter state"
                    required
                  />
                </div>
              </div>

              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={newAddress.zipCode}
                    onChange={handleAddressChange}
                    className="form-input"
                    placeholder="Enter ZIP code"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newAddress.phone}
                    onChange={handleAddressChange}
                    className="form-input"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={newAddress.isDefault}
                      onChange={handleAddressChange}
                      className="form-checkbox"
                    />
                    <span>Set as default address</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Address'}
                </button>
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => {
                    setShowAddAddress(false)
                    setNewAddress({
                      fullName: '',
                      addressLine1: '',
                      addressLine2: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      country: 'USA',
                      phone: '',
                      type: 'HOME',
                      isDefault: false
                    })
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Address Form */}
      {editingAddress && (
        <div className="edit-address-form-container">
          <div className="edit-address-form">
            <h3 className="form-title">Edit Address</h3>
            <form onSubmit={handleUpdateAddress}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={editingAddress.fullName || ''}
                    onChange={handleEditAddressChange}
                    className="form-input"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Address Line 1</label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={editingAddress.addressLine1 || editingAddress.street || ''}
                    onChange={handleEditAddressChange}
                    className="form-input"
                    placeholder="Street address, P.O. box"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Address Line 2</label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={editingAddress.addressLine2 || ''}
                    onChange={handleEditAddressChange}
                    className="form-input"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>
              </div>

              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    value={editingAddress.city || ''}
                    onChange={handleEditAddressChange}
                    className="form-input"
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    value={editingAddress.state || ''}
                    onChange={handleEditAddressChange}
                    className="form-input"
                    placeholder="Enter state"
                    required
                  />
                </div>
              </div>

              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={editingAddress.zipCode || ''}
                    onChange={handleEditAddressChange}
                    className="form-input"
                    placeholder="Enter ZIP code"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editingAddress.phone || ''}
                    onChange={handleEditAddressChange}
                    className="form-input"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Address'}
                </button>
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="addresses-grid">
        {addresses.length === 0 ? (
          <div className="no-addresses">
            <p>No addresses added yet. Click "Add new address" to get started.</p>
          </div>
        ) : (
          addresses.map(address => (
            <div key={address.id} className="address-card">
              <div className="address-header">
                <h3>{address.fullName || address.name}</h3>
                {(address.isDefault || address.defaultAddress) && (
                  <span className="default-badge">Default</span>
                )}
              </div>
              <p>{address.addressLine1 || address.street}</p>
              {address.addressLine2 && <p>{address.addressLine2}</p>}
              <p>{address.city}, {address.state} {address.zipCode}</p>
              <p>Phone: {address.phone}</p>
              {address.type && <p>Type: {address.type}</p>}
              <div className="address-actions">
                {!(address.isDefault || address.defaultAddress) && (
                  <button 
                    className="set-default-btn"
                    onClick={() => handleSetDefaultAddress(address.id)}
                  >
                    Set as default
                  </button>
                )}
                <button 
                  className="edit-btn"
                  onClick={() => handleEditAddress(address)}
                >
                  Edit
                </button>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDeleteAddress(address.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AddressesPage
