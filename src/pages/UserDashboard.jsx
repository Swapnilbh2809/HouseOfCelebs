import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function UserDashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('hoc_user_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/user/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
      } catch (err) {
        console.error("Failed to fetch bookings");
      } finally {
        setLoadingBookings(false);
      }
    };
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const token = localStorage.getItem('hoc_user_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/user/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert("Booking cancelled successfully!");
        setBookings(prev => prev.map(b => b._id === bookingId ? data.booking : b));
      } else {
        alert(data.error || "Failed to cancel booking");
      }
    } catch (err) {
      alert("Error cancelling booking");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="font-inter" style={{ minHeight: '100vh', background: '#111111', color: '#ffffff', paddingTop: '96px' }}>
      {/* ── Profile Hero ── */}
      <div style={{
        padding: '44px 40px 36px',
        borderBottom: '1px solid #2a2a2a',
        background: 'linear-gradient(180deg, #1a0a0a 0%, #111111 100%)'
      }}>
        <p style={{
          color: '#f5a623', fontSize: '0.8rem', fontWeight: 700,
          letterSpacing: '2px', marginBottom: '8px'
        }}>
          YOUR PRIVATE THEATRE AWAITS
        </p>
        <h1 className="font-bebas tracking-wide" style={{
          fontSize: '2.5rem', fontWeight: 400,
          marginBottom: '20px'
        }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>

        {/* Avatar row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              style={{
                width: '54px', height: '54px', borderRadius: '50%',
                border: '2px solid #e63946', objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '54px', height: '54px', borderRadius: '50%',
              background: '#e63946', border: '2px solid #e63946',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1.4rem', color: '#fff'
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user?.name}
              {/* ADMIN BADGE — only renders when role === 'admin' */}
              {isAdmin() && (
                <span style={{
                  background: '#f5a623', color: '#111111',
                  fontSize: '0.65rem', fontWeight: 800,
                  padding: '2px 9px', borderRadius: '999px',
                  letterSpacing: '0.5px'
                }}>
                  ADMIN
                </span>
              )}
            </div>
            <div style={{ color: '#aaaaaa', fontSize: '0.82rem', marginTop: '2px' }}>
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ padding: '40px', maxWidth: '1100px' }}>

        {/* Quick Actions */}
        <h2 className="font-bebas tracking-wide" style={{
          fontSize: '1.5rem', fontWeight: 400,
          marginBottom: '18px', color: '#ffffff', textAlign: 'center'
        }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '40px' }}>
          <Link to="/book" className="font-bebas tracking-wider" style={{
            background: '#e63946', color: '#ffffff', textDecoration: 'none',
            padding: '11px 32px', borderRadius: '999px',
            fontSize: '1.2rem'
          }}>
            BOOK
          </Link>
          <Link to="/" className="font-bebas tracking-wider" style={{
            background: 'transparent', color: '#ffffff', textDecoration: 'none',
            padding: '11px 32px', borderRadius: '999px',
            fontSize: '1.2rem',
            border: '1px solid #2a2a2a'
          }}>
            HOME
          </Link>
          <button onClick={handleLogout} className="font-bebas tracking-wider transition-colors" style={{
            background: 'transparent', color: '#e63946',
            padding: '11px 32px', borderRadius: '999px',
            fontSize: '1.2rem',
            border: '1px solid #e63946',
            cursor: 'pointer'
          }}>
            SIGN OUT
          </button>

          {/* ── ADMIN ONLY BUTTON ──
              This entire block is conditionally rendered.
              isAdmin() returns true ONLY when user.role === 'admin'
              Normal users never see this element in the DOM. */}
          {isAdmin() && (
            <Link to="/admin" style={{
              background: '#f5a623', color: '#111111', textDecoration: 'none',
              padding: '11px 26px', borderRadius: '999px',
              fontWeight: 800, fontSize: '0.9rem'
            }}>
              ⚙️ Admin Dashboard
            </Link>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#2a2a2a', marginBottom: '36px' }} />

        {/* My Bookings */}
        <h2 className="font-bebas tracking-wide" style={{
          fontSize: '1.5rem', fontWeight: 400,
          marginBottom: '18px'
        }}>
          My Bookings
        </h2>
        
        {loadingBookings ? (
          <p style={{ color: '#aaaaaa', marginBottom: '40px', fontFamily: 'inherit' }}>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div style={{
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            borderRadius: '12px', padding: '32px', textAlign: 'center',
            marginBottom: '40px'
          }}>
            <p style={{ color: '#aaaaaa', marginBottom: '16px', fontFamily: 'inherit' }}>You don't have any bookings yet.</p>
            <Link to="/book" className="font-bebas tracking-wider" style={{
              background: '#e63946', color: '#ffffff', textDecoration: 'none',
              padding: '8px 24px', borderRadius: '999px', fontSize: '1rem'
            }}>
              EXPLORE PACKAGES
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {bookings.map(booking => {
              const isUpcoming = new Date(booking.date) > new Date() && booking.status !== 'cancelled';
              return (
                <div key={booking._id} style={{
                  background: '#1a1a1a', border: '1px solid #2a2a2a',
                  borderRadius: '12px', padding: '20px',
                  display: 'flex', flexDirection: 'column',
                  position: 'relative', overflow: 'hidden',
                  fontFamily: 'inherit'
                }}>
                  {booking.status === 'cancelled' && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#e63946', color: 'white', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', padding: '4px' }}>
                      CANCELLED
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', marginTop: booking.status === 'cancelled' ? '16px' : '0' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f5a623' }}>
                      {booking.roomType.charAt(0).toUpperCase() + booking.roomType.slice(1)} Room
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#aaaaaa' }}>
                      ₹{booking.totalAmount}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#aaaaaa', marginBottom: '12px', lineHeight: 1.6 }}>
                    <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
                    <p><strong>Status:</strong> {booking.paymentStatus.toUpperCase()}</p>
                  </div>
                  
                  {isUpcoming && (
                    <button 
                      onClick={() => handleCancel(booking._id)}
                      className="font-bebas tracking-wider transition-colors"
                      style={{
                        marginTop: 'auto', background: 'transparent', border: '1px solid #e63946',
                        color: '#e63946', padding: '8px', borderRadius: '8px',
                        fontSize: '1rem', cursor: 'pointer'
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = '#e63946'; e.currentTarget.style.color = '#fff'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#e63946'; }}
                    >
                      REQUEST CANCELLATION
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: '1px', background: '#2a2a2a', marginBottom: '36px' }} />

        {/* Account Info */}
        <h2 className="font-bebas tracking-wide" style={{
          fontSize: '1.5rem', fontWeight: 400,
          marginBottom: '18px'
        }}>
          Account Details
        </h2>
        <div style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a',
          borderRadius: '12px', padding: '8px 24px',
          maxWidth: '440px'
        }}>
          {[
            { label: 'Name', value: user?.name },
            { label: 'Email', value: user?.email },
            { label: 'Account Type', value: user?.role === 'admin' ? 'Administrator' : 'Guest Member' },
            { label: 'Login Method', value: 'Google OAuth' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '14px 0',
              borderBottom: '1px solid #2a2a2a'
            }}>
              <span style={{ color: '#aaaaaa', fontSize: '0.82rem' }}>{label}</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{value || '—'}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
