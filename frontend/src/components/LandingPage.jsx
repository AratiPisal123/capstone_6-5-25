import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const navigate = useNavigate()
  
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="logo">
          🏥 BluWalls
          <span>MEDICINE</span>
        </div>
      </header>
      <div className="landing-content">
        <h1>Connecting healthcare for businesses and consumers</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ulloreo aliqua. Ut enim ad minim veniam, quis nostrus exercitation laboris loborfi ut eillo eem.</p>
        <div className="landing-cards">
          <div
            className="landing-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/login')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') navigate('/login')
            }}
            style={{ cursor: 'pointer' }}
          >
            <span>🏥</span>
            <h3>Medbudy</h3>
            <p>B2C</p>
          </div>
          <div className="landing-card" style={{ opacity: 0.8 }}>
            <span>📊</span>
            <h3>Medbiz</h3>
            <p>B2B</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
