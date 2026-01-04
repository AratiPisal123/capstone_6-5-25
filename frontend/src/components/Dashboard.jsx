import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../redux/slices/authSlice'
import HomePage from './pages/HomePage'
import CataloguePage from './pages/CataloguePage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import OrdersPage from './pages/OrdersPage'
import WishlistPage from './pages/WishlistPage'
import AddressesPage from './pages/AddressesPage'
import SupportPage from './pages/SupportPage'
import OrderDetailsPage from './pages/OrderDetailsPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import OffersPage from './pages/OffersPage'
import InvoicePage from './pages/InvoicePage'
import ShoppingCartPage from './pages/ShoppingCartPage'
import PrescriptionManagementPage from './pages/PrescriptionManagementPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage from './pages/ProfilePage'
import ProductDetailPage from './pages/ProductDetailPage'
import './Dashboard.css'

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector(state => state.auth?.user)
  const dispatch = useDispatch()

  const handleLogout = () => {
    console.log('Logout initiated')
    dispatch(logout())
    navigate('/login')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/home' },
    { id: 'catalogue', label: 'Catalogue', icon: '📚', path: '/catalogue' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '🔄', path: '/subscriptions' },
    { id: 'orders', label: 'Orders', icon: '📦', path: '/orders' },
    { id: 'wishlist', label: 'Wishlist', icon: '❤️', path: '/wishlist' },
    { id: 'addresses', label: 'Addresses', icon: '📍', path: '/addresses' },
    { id: 'support', label: 'Support', icon: '💬', path: '/support' },
    { id: 'offers', label: 'Offers', icon: '🏷️', path: '/offers' },
    { id: 'invoices', label: 'Invoices', icon: '📄', path: '/invoices' },
    { id: 'shopping-cart', label: 'Cart', icon: '🛒', path: '/shopping-cart' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '💊', path: '/prescriptions' }
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-left">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <h1 className="header-logo">🏥 Medbudy</h1>
        </div>
        <input type="text" className="header-search" placeholder="Search products, orders, help" />
        <div className="header-right">
          <button 
            className={`header-icon-btn ${isActive('/wishlist') ? 'active' : ''}`}
            onClick={() => navigate('/wishlist')}
            title="Wishlist"
          >
            ❤️
          </button>
          <button 
            className={`header-icon-btn ${isActive('/offers') ? 'active' : ''}`}
            onClick={() => navigate('/offers')}
            title="Offers"
          >
            🛍️ Offers
          </button>
          <button 
            className={`header-icon-btn ${isActive('/shopping-cart') ? 'active' : ''}`}
            onClick={() => navigate('/shopping-cart')}
            title="Shopping Cart"
          >
            🛒 Cart (2)
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div 
            className="sidebar-user"
            onClick={() => navigate('/profile')}
            style={{ cursor: 'pointer' }}
          >
            <div className="user-avatar">{user?.name?.charAt(0) || 'C'}</div>
            <p className="user-name">{user?.name || 'John Doe'}</p>
            <p className="user-type">B2C Customer</p>
          </div>

          <nav className="sidebar-menu">
            <ul>
              {menuItems.map(item => (
                <li 
                  key={item.id}
                  onClick={() => navigate(item.path)} 
                  className={isActive(item.path) ? 'active' : ''}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </li>
              ))}
            </ul>
          </nav>

          <button onClick={handleLogout} className="sidebar-logout">Logout</button>
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-content">
            <Routes>
              <Route path="/home" element={<HomePage />} />
              <Route path="/catalogue" element={<CataloguePage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/addresses" element={<AddressesPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/order-details/:orderNumber" element={<OrderDetailsPage />} />
              <Route path="/order-tracking" element={<OrderTrackingPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/invoices" element={<InvoicePage />} />
              <Route path="/shopping-cart" element={<ShoppingCartPage />} />
              <Route path="/prescriptions" element={<PrescriptionManagementPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/products/:sku" element={<ProductDetailPage />} />
              <Route path="/products" element={<CataloguePage />} />
              <Route path="/" element={<HomePage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
