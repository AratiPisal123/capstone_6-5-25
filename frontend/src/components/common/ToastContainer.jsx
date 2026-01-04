import React from 'react'
import { useToast } from '../../contexts/ToastContext'
import Toast from './Toast'
import './Toast.css'

const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div className="toast-container">
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

export default ToastContainer
