import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Signup from './components/Signup'
import SuccessPage from './components/SuccessPage'
import Dashboard from './components/Dashboard'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import ToastContainer from './components/common/ToastContainer'
import './App.css'
import './assets/styles/global.css'

function AppContent() {
  const isAuthenticated = useSelector(state => state.auth?.isAuthenticated || false)

  if (isAuthenticated) {
    console.log('User is authenticated, showing Dashboard')
    return <Dashboard />
  }

  console.log('User not authenticated, showing auth pages')

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/success" element={<SuccessPage />} />
      
      {/* All authenticated routes */}
      <Route path="/home" element={<Dashboard />} />
      <Route path="/catalogue" element={<Dashboard />} />
      <Route path="/subscriptions" element={<Dashboard />} />
      <Route path="/orders" element={<Dashboard />} />
      <Route path="/wishlist" element={<Dashboard />} />
      <Route path="/addresses" element={<Dashboard />} />
      <Route path="/support" element={<Dashboard />} />
      <Route path="/order-details" element={<Dashboard />} />
      <Route path="/order-tracking" element={<Dashboard />} />
      <Route path="/offers" element={<Dashboard />} />
      <Route path="/invoices" element={<Dashboard />} />
      <Route path="/shopping-cart" element={<Dashboard />} />
      <Route path="/prescriptions" element={<Dashboard />} />
      <Route path="/order-confirmation" element={<Dashboard />} />
      <Route path="/checkout" element={<Dashboard />} />
      <Route path="/profile" element={<Dashboard />} />
      <Route path="/products/:id" element={<Dashboard />} />
      <Route path="/products/:sku" element={<Dashboard />} />
      <Route path="/products" element={<Dashboard />} />
      
      {/* Fallback for unauthenticated users */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

function App() {
  return (
    <>
      <AppContent />
      <ToastContainer />
    </>
  )
}

export default App
