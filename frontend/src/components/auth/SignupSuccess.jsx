import { useState } from 'react'
import './EmailVerification.css'

function SignupSuccess({ onNavigate }) {
  return (
    <div className="signup-success-container">
      <div className="success-icon">✓</div>
      <h2>Email Verified Successfully!</h2>
      <p>Your account has been created and verified.</p>
      <p>You can now login with your credentials.</p>
      
      <button 
        className="login-now-btn" 
        onClick={() => onNavigate('login')}
      >
        Login Now
      </button>
      
      <div className="success-info">
        <p>🎉 Welcome to BluWalls Medbudy!</p>
        <p>You can now access all features including:</p>
        <ul>
          <li>Order prescription medications</li>
          <li>Stay connected with your healthcare providers</li>
          <li>stay healthy</li>
          
        </ul>
      </div>
    </div>
  )
}

export default SignupSuccess
