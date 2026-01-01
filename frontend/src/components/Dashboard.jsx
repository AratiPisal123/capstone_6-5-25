import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/actions/authActions'
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
import InvoicesPage from './pages/InvoicesPage'
import ShoppingCartPage from './pages/ShoppingCartPage'
import PrescriptionManagementPage from './pages/PrescriptionManagementPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage from './pages/ProfilePage'
import './Dashboard.css'

function Dashboard() {
  const [currentPage, setCurrentPage] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(true) // Start with sidebar open
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()

  const handleLogout = () => {
    console.log('Logout initiated')
    
    // Dispatch logout action to update Redux state and clear localStorage
    dispatch(logout())
    
    console.log('Logout dispatched')
    
    // Force redirect to login page immediately
    window.location.replace('/login')
    
    // Fallback redirect
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }, 100)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'catalogue', label: 'Catalogue', icon: '📚' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '🔄' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
    { id: 'addresses', label: 'Addresses', icon: '📍' },
    { id: 'support', label: 'Support', icon: '💬' },
    { id: 'offers', label: 'Offers', icon: '🏷️' },
    { id: 'invoices', label: 'Invoices', icon: '📄' },
    { id: 'shopping-cart', label: 'Cart', icon: '🛒' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '💊' }
  ]

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'catalogue':
        return <CataloguePage />
      case 'subscriptions':
        return <SubscriptionsPage />
      case 'orders':
        return <OrdersPage />
      case 'wishlist':
        return <WishlistPage />
      case 'addresses':
        return <AddressesPage />
      case 'support':
        return <SupportPage />
      case 'order-details':
        return <OrderDetailsPage />
      case 'order-tracking':
        return <OrderTrackingPage />
      case 'offers':
        return <OffersPage />
      case 'invoices':
        return <InvoicesPage />
      case 'shopping-cart':
        return <ShoppingCartPage />
      case 'prescriptions':
        return <PrescriptionManagementPage />
      case 'order-confirmation':
        return <OrderConfirmationPage />
      case 'checkout':
        return <CheckoutPage />
      case 'profile':
        return <ProfilePage />
      default:
        return <HomePage />
    }
  }

  const getRightSidebarLabel = () => {
    const labels = {
      'home': 'Dashboard',
      'catalogue': 'B2C Catalogue',
      'subscriptions': 'Subscriptions',
      'orders': 'Orders List',
      'wishlist': 'Wishlist',
      'addresses': 'Address Management',
      'support': 'Support',
      'offers': 'Special Offers',
      'invoices': 'Invoice History',
      'shopping-cart': 'Your Cart',
      'prescriptions': 'Manage Prescriptions'
    }
    return labels[currentPage] || 'Dashboard'
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
            className={`header-icon-btn ${currentPage === 'wishlist' ? 'active' : ''}`}
            onClick={() => setCurrentPage('wishlist')}
            title="Wishlist"
          >
            ❤️
          </button>
          <button 
            className={`header-icon-btn ${currentPage === 'offers' ? 'active' : ''}`}
            onClick={() => setCurrentPage('offers')}
            title="Offers"
          >
            🛍️ Offers
          </button>
          <button 
            className={`header-icon-btn ${currentPage === 'shopping-cart' ? 'active' : ''}`}
            onClick={() => setCurrentPage('shopping-cart')}
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
            onClick={() => setCurrentPage('profile')}
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
                  onClick={() => setCurrentPage(item.id)} 
                  className={currentPage === item.id ? 'active' : ''}
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
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
