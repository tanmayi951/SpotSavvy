import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Car, MapPin, Navigation, Compass, User, Sparkles, X, CheckCircle2, Settings, LogOut, CreditCard, Bell, Shield, Clock } from 'lucide-react';

const socket = io('http://localhost:3000');

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [password, setPassword] = useState('');
  const [currentTab, setCurrentTab] = useState('explore');
  const [showNavigation, setShowNavigation] = useState(false);
  const [navTarget, setNavTarget] = useState(null);

  const [spots, setSpots] = useState([]);
  const [connected, setConnected] = useState(false);
  
  // UPI Modal State
  const [showUPI, setShowUPI] = useState(false);
  const [upiStep, setUpiStep] = useState(1);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    
    socket.on('parking_snapshot', (data) => setSpots(data));
    socket.on('parking_update', (data) => setSpots(data.spots || data));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('parking_snapshot');
      socket.off('parking_update');
    };
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    if (username) {
      localStorage.setItem('username', username);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    setCurrentTab('explore');
  };

  const handleReserveClick = (spot) => {
    setSelectedSpot(spot);
    setUpiStep(1);
    setUpiId('');
    setShowUPI(true);
  };

  const handleNavigateClick = (spot) => {
    setNavTarget(spot);
    setShowNavigation(true);
  };

  const handleProcessPayment = () => {
    setUpiStep('processing');
    setTimeout(() => {
      setUpiStep('success');
      setTimeout(() => {
        setShowUPI(false);
        alert(`✅ Spot ${selectedSpot.number} has been successfully reserved and paid for!`);
      }, 2000);
    }, 2500);
  };

  // AI Recommendation Logic: Find nearest available spot
  const availableSpots = spots.filter(s => s.status === 'available');
  const recommendedSpot = availableSpots.length > 0 ? availableSpots[0] : null;

  // Other nearby spots for the list
  const otherSpots = availableSpots.slice(1, 6);

  if (!isLoggedIn) {
    return (
      <div className="mobile-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem', minHeight: '100vh', paddingBottom: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'fadeIn 0.8s ease' }}>
          <div style={{ display: 'inline-flex', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(167, 139, 250, 0.2) 100%)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
            <Car size={48} color="var(--accent)" />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SpotSavvy</h1>
          <p style={{ color: 'var(--text-secondary)' }}>AI-Powered Smart Parking</p>
        </div>
        
        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', animation: 'fadeIn 0.8s ease 0.2s both', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Welcome Back</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email or Username</label>
            <input 
              type="text" 
              placeholder="Enter your email" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', transition: 'border-color 0.2s', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', transition: 'border-color 0.2s', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          
          <button 
            onClick={handleLogin}
            style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.target.style.background = '#2563eb'}
            onMouseOut={(e) => e.target.style.background = 'var(--accent)'}
          >
            Sign In
          </button>
        </div>
        
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem', animation: 'fadeIn 0.8s ease 0.4s both' }}>
          Don't have an account? <span style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>Sign up</span>
        </p>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      <div className="header">
        <h1><Car /> SpotSavvy</h1>
        {connected ? (
          <div className="status-badge"><div className="status-dot"></div> Live GPS Connected</div>
        ) : (
          <div className="status-badge" style={{color: '#f59e0b'}}><div className="status-dot" style={{background: '#f59e0b'}}></div> Connecting...</div>
        )}
      </div>

      <div className="content">
        {currentTab === 'explore' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 className="section-title">AI Recommended Spot</h2>
            
            {recommendedSpot ? (
              <div className="ai-card">
                <div className="ai-card-bg"><Sparkles size={120} /></div>
                <div className="ai-badge"><Sparkles size={12} style={{display:'inline', marginRight:4}}/> Shortest Route</div>
                <div className="ai-spot-number">Spot {recommendedSpot.number}</div>
                <div className="ai-spot-lot">{recommendedSpot.lotId.replace('_', ' ')} • 2 mins away</div>
                <div style={{display:'flex', gap:'1rem', marginTop: '1rem', position: 'relative', zIndex: 5}}>
                    <button className="btn-nav" onClick={() => handleReserveClick(recommendedSpot)} style={{background: 'var(--accent)', flex: 1, padding: '0.75rem', fontSize: '0.95rem'}}>
                      Reserve & Pay
                    </button>
                    <button className="btn-nav" onClick={() => handleNavigateClick(recommendedSpot)} style={{flex: 1, padding: '0.75rem', fontSize: '0.95rem'}}>
                      <Navigation size={18} /> Navigate
                    </button>
                </div>
              </div>
            ) : (
              <div className="ai-card" style={{textAlign: 'center', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', border: 'none'}}>
                <p>Scanning city for available spots...</p>
              </div>
            )}

            <h2 className="section-title">Other Nearby Spots</h2>
            <div className="spots-list">
              {otherSpots.map(spot => (
                <div key={spot.id} className="spot-item">
                  <div className="spot-info">
                    <h4>Spot {spot.number}</h4>
                    <p>{spot.lotId.replace('_', ' ')} • {Math.floor(Math.random() * 5) + 3} mins</p>
                  </div>
                  <button className="btn-reserve" onClick={() => handleReserveClick(spot)}>Reserve</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'saved' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 className="section-title">Saved Spots</h2>
            <div className="spots-list">
              <div className="spot-item">
                <div className="spot-info">
                  <h4>Spot 42</h4>
                  <p>Central Plaza • Favorite</p>
                </div>
                <button className="btn-reserve" onClick={() => handleReserveClick({id: 's42', number: '42', lotId: 'Central_Plaza'})}>Reserve</button>
              </div>
              <div className="spot-item">
                <div className="spot-info">
                  <h4>Spot 18</h4>
                  <p>Mall Parking • Favorite</p>
                </div>
                <button className="btn-reserve" onClick={() => handleReserveClick({id: 's18', number: '18', lotId: 'Mall_Parking'})}>Reserve</button>
              </div>
              <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-secondary)' }}>
                <MapPin size={48} opacity={0.2} style={{ margin: '0 auto 1rem' }} />
                <p>No more saved spots.</p>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'vehicle' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 className="section-title">My Vehicle</h2>
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '1rem', color: 'var(--accent)' }}>
                  <Car size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'white' }}>Primary Vehicle</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Auto-linked to LPR Cameras</p>
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>License Plate</label>
                <input type="text" defaultValue="KA04 MZ 1234" style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--accent)', color: 'white', fontWeight: 'bold', letterSpacing: '2px', outline: 'none' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Make/Model</label>
                  <input type="text" defaultValue="Tesla Model 3" style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Color</label>
                  <input type="text" defaultValue="Pearl White" style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
                </div>
              </div>
              
              <button style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'} onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}>Save Changes</button>
            </div>
          </div>
        )}

        {currentTab === 'profile' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 className="section-title">Profile</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', padding: '0.5rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #a78bfa)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.75rem', fontWeight: 'bold', color: 'white', boxShadow: '0 4px 15px rgba(167, 139, 250, 0.4)' }}>
                {username ? username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'white' }}>{username || 'Guest User'}</h3>
                <p style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600 }}>Pro Member</p>
              </div>
            </div>

            <div className="spots-list">
              <div className="spot-item" style={{ padding: '1.25rem', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <CreditCard size={20} color="var(--text-secondary)" />
                  <span style={{ color: 'white' }}>Payment Methods</span>
                </div>
              </div>
              <div className="spot-item" style={{ padding: '1.25rem', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Clock size={20} color="var(--text-secondary)" />
                  <span style={{ color: 'white' }}>Parking History</span>
                </div>
              </div>
              <div className="spot-item" style={{ padding: '1.25rem', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Bell size={20} color="var(--text-secondary)" />
                  <span style={{ color: 'white' }}>Notifications</span>
                </div>
              </div>
              <div className="spot-item" style={{ padding: '1.25rem', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Shield size={20} color="var(--text-secondary)" />
                  <span style={{ color: 'white' }}>Privacy & Security</span>
                </div>
              </div>
              <div className="spot-item" style={{ padding: '1.25rem', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Settings size={20} color="var(--text-secondary)" />
                  <span style={{ color: 'white' }}>App Settings</span>
                </div>
              </div>
              <div className="spot-item" style={{ padding: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)', marginTop: '1rem', cursor: 'pointer', transition: 'background 0.2s' }} onClick={handleLogout} onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.05)'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--danger)' }}>
                  <LogOut size={20} />
                  <span style={{ fontWeight: '600' }}>Log Out</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bottom-nav">
        <div className={`nav-item ${currentTab === 'explore' ? 'active' : ''}`} onClick={() => setCurrentTab('explore')}><Compass size={24} /><span>Explore</span></div>
        <div className={`nav-item ${currentTab === 'saved' ? 'active' : ''}`} onClick={() => setCurrentTab('saved')}><MapPin size={24} /><span>Saved</span></div>
        <div className={`nav-item ${currentTab === 'vehicle' ? 'active' : ''}`} onClick={() => setCurrentTab('vehicle')}><Car size={24} /><span>My Vehicle</span></div>
        <div className={`nav-item ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => setCurrentTab('profile')}><User size={24} /><span>Profile</span></div>
      </div>

      {/* UPI Payment Modal */}
      {showUPI && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{color: 'white', fontSize: '1.1rem'}}>Secure UPI Payment</h3>
              <button className="close-btn" onClick={() => setShowUPI(false)}><X size={20} /></button>
            </div>
            
            {upiStep === 1 && (
              <div className="upi-step">
                <p style={{color: '#94a3b8', margin: '1.5rem', textAlign: 'center'}}>
                  Scan QR to reserve Spot <br/>
                  <span style={{color: 'white', fontSize: '1.5rem', fontWeight: 'bold'}}>{selectedSpot?.number}</span>
                </p>
                <div className="qr-container">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=spotsavvy@upi&pn=SpotSavvy&am=30.00&cu=INR" alt="UPI QR" />
                </div>
                <div className="divider"><span>OR</span></div>
                <div className="upi-input-group">
                  <input 
                    type="text" 
                    placeholder="Enter UPI ID (e.g. user@ybl)" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                  <button className="btn-primary" onClick={handleProcessPayment} style={{width:'100%', marginTop: '1rem', padding: '1rem', borderRadius: '0.75rem', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 'bold'}}>
                    Pay ₹30.00 Securely
                  </button>
                </div>
              </div>
            )}

            {upiStep === 'processing' && (
              <div className="upi-step" style={{textAlign: 'center', padding: '3rem 2rem'}}>
                <div className="spinner"></div>
                <h3 style={{marginTop: '1.5rem', color: 'var(--accent)'}}>Processing Payment...</h3>
                <p style={{color: '#94a3b8', marginTop: '0.5rem'}}>Securely connecting to your bank.</p>
              </div>
            )}

            {upiStep === 'success' && (
              <div className="upi-step" style={{textAlign: 'center', padding: '3rem 2rem'}}>
                <CheckCircle2 size={64} color="var(--success)" style={{margin: '0 auto 1rem'}} />
                <h3 style={{color: 'var(--success)', marginBottom: '0.5rem', fontSize: '1.5rem'}}>Payment Successful!</h3>
                <p style={{color: '#94a3b8'}}>₹30.00 received. Your spot is secured.</p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Navigation Overlay */}
      {showNavigation && (
        <div className="modal-overlay" style={{ background: '#0f172a', zIndex: 100 }}>
          {/* Simulated Map Background */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Nav Header */}
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '2rem 1.5rem 1rem', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--accent)', padding: '0.75rem', borderRadius: '50%', color: 'white' }}>
                  <Navigation size={24} style={{ transform: 'rotate(45deg)' }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>2 mins</h2>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>0.8 km • Spot {navTarget?.number}</p>
                </div>
              </div>
              <button onClick={() => setShowNavigation(false)} style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: 'var(--danger)', padding: '0.75rem 1.25rem', borderRadius: '2rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                Exit
              </button>
            </div>

            {/* Simulated Path (CSS Graphic) */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.5s ease' }}>
              {/* Route Line */}
              <div style={{ position: 'absolute', width: '8px', height: '60%', background: 'var(--accent)', borderRadius: '4px', top: '20%', boxShadow: '0 0 20px var(--accent)' }}></div>
              {/* Current Position Marker */}
              <div style={{ position: 'absolute', bottom: '15%', width: '30px', height: '30px', background: 'white', borderRadius: '50%', border: '6px solid var(--accent)', boxShadow: '0 0 15px rgba(0,0,0,0.5)', zIndex: 2 }}></div>
              {/* Target Marker */}
              <div style={{ position: 'absolute', top: '15%', background: 'var(--success)', padding: '0.5rem 1rem', borderRadius: '2rem', color: 'white', fontWeight: 'bold', boxShadow: '0 5px 15px rgba(16, 185, 129, 0.4)', zIndex: 2 }}>
                Spot {navTarget?.number}
              </div>
            </div>

            {/* Next Turn Instruction */}
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', margin: '0 1rem 2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 -10px 30px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '1.5rem', zIndex: 10 }}>
              <div style={{ fontSize: '2.5rem', color: 'white', fontWeight: 'bold' }}>↑</div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Continue straight</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Then turn right into {navTarget?.lotId?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
