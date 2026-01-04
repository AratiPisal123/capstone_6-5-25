import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { apiRequest } from '../../utils/api'
import { loginSuccess, updateUser } from '../../redux/slices/authSlice'

function ProfilePage() {
  const user = useSelector(state => state.auth?.user)
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  })
  const [profilePicture, setProfilePicture] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState('')
  const [addresses, setAddresses] = useState([])
  const [editingAddress, setEditingAddress] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showAddAddress, setShowAddAddress] = useState(false)
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
    defaultAddress: false
  })

  useEffect(() => {
    console.log('ProfilePage - User data changed:', user)
    console.log('ProfilePage - User profileImage:', user?.profileImage)
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        password: ''
      })
      // Set profile picture if user has one
      if (user.profileImage) {
        console.log('Setting profile picture preview from user data:', user.profileImage)
        setProfilePicturePreview(user.profileImage)
      } else {
        console.log('No profile image found in user data')
      }
      fetchAddresses()
    }
  }, [user])

  // Fetch latest user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await apiRequest('/user')
        dispatch(updateUser(userData))
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('authUser', JSON.stringify(userData))
      } catch (err) {
        console.error('Failed to fetch user data:', err)
      }
    }
    
    if (user) {
      fetchUserData()
    }
  }, []) // Only run once on mount

  const fetchAddresses = async () => {
    try {
      const data = await apiRequest('/addresses')
      setAddresses(data || [])
    } catch (err) {
      console.error('Failed to fetch addresses:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSaveChanges = async () => {
    setLoading(true)
    setMessage('')
    try {
      const updateData = {
        name: formData.name,
        mobile: formData.mobile
      }
      
      const updatedUser = await apiRequest('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })
      
      // Update Redux state with new user data
      dispatch(updateUser(updatedUser))
      
      // Update localStorage with correct key
      localStorage.setItem('user', JSON.stringify(updatedUser))
      localStorage.setItem('authUser', JSON.stringify(updatedUser))
      localStorage.setItem('userName', updatedUser?.name || updatedUser?.email)
      
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiRequest('/addresses', {
        method: 'POST',
        body: JSON.stringify(newAddress)
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
        defaultAddress: false
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
    if (!confirm('Are you sure you want to delete this address?')) return
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

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      console.log('Profile picture file selected:', file.name, file.size)
      
      // Check file size (max 2MB for upload)
      if (file.size > 2 * 1024 * 1024) {
        setMessage('Profile picture must be less than 2MB')
        setTimeout(() => setMessage(''), 3000)
        return
      }

      // Create a canvas to compress the image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = async () => {
        // Resize image to max 300x300 for profile picture
        const maxSize = 300
        let width = img.width
        let height = img.height
        
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress the image
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to base64 with reduced quality
        const base64String = canvas.toDataURL('image/jpeg', 0.7)
        console.log('Compressed base64 string length:', base64String.length)
        
        setProfilePicturePreview(base64String)
        
        try {
          // Upload profile picture as base64
          const response = await apiRequest('/user/profile-picture-url', {
            method: 'POST',
            body: JSON.stringify({ imageUrl: base64String })
          })
          
          console.log('Profile picture upload response:', response)
          
          // Update user data in Redux and localStorage
          const updatedUser = { ...user, profileImage: base64String }
          console.log('Updating user data with profile image:', updatedUser)
          dispatch(updateUser(updatedUser))
          localStorage.setItem('user', JSON.stringify(updatedUser))
          localStorage.setItem('authUser', JSON.stringify(updatedUser))
          
          setMessage('Profile picture updated successfully!')
          setTimeout(() => setMessage(''), 3000)
        } catch (err) {
          console.error('Profile picture upload error:', err)
          setMessage(err.message || 'Failed to update profile picture')
        }
      }
      
      img.onerror = () => {
        setMessage('Failed to load image file')
        setTimeout(() => setMessage(''), 3000)
      }
      
      // Start loading the image
      img.src = URL.createObjectURL(file)
    }
  }

  const handleEditAddressChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditingAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="profile-page-wrapper">
      <div className="profile-header-section">
        <h2>Profile <span className="breadcrumb-arrow"></span></h2>
      </div>

      <div className="profile-main-content">
        {/* Left Column - Edit Profile */}
        <div className="profile-edit-section">
          <h3 className="section-title">Edit profile</h3>
          
          <div className="profile-photo-section">
            <div className="profile-photo-container">
              {profilePicturePreview ? (
                <img src={profilePicturePreview} alt="Profile" className="profile-photo" />
              ) : (
                <div className="profile-photo-placeholder">👤</div>
              )}
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="profilePicture" className="change-photo-link">
                Change photo
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your email"
              disabled
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mobile</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your mobile number"
            />
          </div>

          <div className="form-group">
            <label className="form-label">New password (leave blank to keep current)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter new password"
            />
          </div>

          {message && <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}

          <div className="form-actions">
            <button className="btn-save" onClick={handleSaveChanges} disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </button>
            <button className="btn-cancel">Cancel</button>
          </div>
        </div>

        {/* Right Column - Contact & Additional Info */}
        <div className="profile-info-section">
          {/* Contact Information */}
          <div className="info-card">
            <h3 className="card-title">Contact information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Email</span>
                <p className="info-value">{formData.email}</p>
              </div>
              <div className="info-item">
                <span className="info-label">Mobile</span>
                <p className="info-value">{formData.mobile}</p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="info-card">
            <h3 className="card-title">Addresses</h3>
            {addresses.length === 0 ? (
              <p>No addresses added yet.</p>
            ) : (
              addresses.map(addr => (
                <div key={addr.id} className="address-item">
                  <div className="address-header">
                    <p className="address-name">{addr.fullName}</p>
                    {(addr.defaultAddress || addr.isDefault) && (
                      <span className="default-badge">Default</span>
                    )}
                  </div>
                  <p className="address-text">{addr.addressLine1}</p>
                  {addr.addressLine2 && <p className="address-text">{addr.addressLine2}</p>}
                  <p className="address-text">{addr.city}, {addr.state} {addr.zipCode}</p>
                  <p className="address-text">📞 {addr.phone}</p>
                  <div className="address-actions">
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => handleEditAddress(addr)}
                    >
                      Edit
                    </button>
                    {!(addr.defaultAddress || addr.isDefault) && (
                      <button 
                        className="action-btn default-btn" 
                        onClick={() => handleSetDefaultAddress(addr.id)}
                      >
                        Set as Default
                      </button>
                    )}
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleDeleteAddress(addr.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
            <div className="address-actions">
              <button className="action-btn add-new-btn" onClick={() => setShowAddAddress(true)}>
                + Add New Address
              </button>
            </div>
          </div>

          {/* Add Address Form */}
          {showAddAddress && (
            <div className="info-card">
              <h3 className="card-title">Add New Address</h3>
              <form onSubmit={handleAddAddress} className="address-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={newAddress.fullName} 
                      onChange={handleAddressChange} 
                      required 
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Address Line 1</label>
                    <input 
                      type="text" 
                      name="addressLine1" 
                      value={newAddress.addressLine1} 
                      onChange={handleAddressChange} 
                      required 
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Address Line 2</label>
                    <input 
                      type="text" 
                      name="addressLine2" 
                      value={newAddress.addressLine2} 
                      onChange={handleAddressChange} 
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-row form-row-2">
                  <div className="form-group">
                    <label>City</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={newAddress.city} 
                      onChange={handleAddressChange} 
                      required 
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input 
                      type="text" 
                      name="state" 
                      value={newAddress.state} 
                      onChange={handleAddressChange} 
                      required 
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-row form-row-2">
                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input 
                      type="text" 
                      name="zipCode" 
                      value={newAddress.zipCode} 
                      onChange={handleAddressChange} 
                      required 
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={newAddress.phone} 
                      onChange={handleAddressChange} 
                      required 
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        name="defaultAddress" 
                        checked={newAddress.defaultAddress} 
                        onChange={handleAddressChange} 
                      />
                      Set as default address
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
                        defaultAddress: false
                      })
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Address Form */}
          {editingAddress && (
            <div className="info-card">
              <h3 className="card-title">Edit Address</h3>
              <form onSubmit={handleUpdateAddress} className="address-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={editingAddress.fullName || ''} 
                      onChange={handleEditAddressChange} 
                      required 
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Address Line 1</label>
                    <input 
                      type="text" 
                      name="addressLine1" 
                      value={editingAddress.addressLine1 || editingAddress.street || ''} 
                      onChange={handleEditAddressChange} 
                      required 
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Address Line 2</label>
                    <input 
                      type="text" 
                      name="addressLine2" 
                      value={editingAddress.addressLine2 || ''} 
                      onChange={handleEditAddressChange} 
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-row form-row-2">
                  <div className="form-group">
                    <label>City</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={editingAddress.city || ''} 
                      onChange={handleEditAddressChange} 
                      required 
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input 
                      type="text" 
                      name="state" 
                      value={editingAddress.state || ''} 
                      onChange={handleEditAddressChange} 
                      required 
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-row form-row-2">
                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input 
                      type="text" 
                      name="zipCode" 
                      value={editingAddress.zipCode || ''} 
                      onChange={handleEditAddressChange} 
                      required 
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={editingAddress.phone || ''} 
                      onChange={handleEditAddressChange} 
                      required 
                      className="form-input"
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
                    onClick={() => setEditingAddress(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payment Methods */}
          <div className="info-card">
            <h3 className="card-title">Payment methods</h3>
            <div className="payment-methods">
              <button className="payment-btn">Cards</button>
              <button className="payment-btn">Wallets</button>
              <button className="payment-btn">Bank Transfer</button>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="info-card">
            <h3 className="card-title">Recent orders</h3>
            <div className="recent-order">
              <p className="order-text">Order #1061 - Delivered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
