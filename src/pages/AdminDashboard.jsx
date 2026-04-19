import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  TrendingUp,
  IndianRupee,
  Users,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  CreditCard,
  LogOut,
  ShieldCheck,
  Eye,
  EyeOff,
  Pencil,
  X
} from 'lucide-react';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings`;
const AUTH_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`;

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('Overview');
  const [bookings, setBookings] = useState([]);
  const [dbStats, setDbStats] = useState({ totalBookings: 0, revenue: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [toast, setToast] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    date: '',
    startTime: '',
    endTime: ''
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const menuRef = useRef(null);

  const resetAuthState = () => {
    setIsAuthenticated(false);
    setBookings([]);
    setDbStats({ totalBookings: 0, revenue: 0 });
    setOpenMenuId(null);
    setIsPanelOpen(false);
    setExpandedBookingId(null);
    setCancellingBooking(null);
    setEditingBooking(null);
  };

  const handleUnauthorized = (message = 'Your session expired. Please log in again.') => {
    resetAuthState();
    setAuthError(message);
  };

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(API_BASE_URL, {
        credentials: 'include'
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setBookings(data);
      const totalRev = data
        .filter((booking) => booking.status !== 'cancelled')
        .reduce((acc, curr) => acc + curr.totalAmount, 0);
      setDbStats({ totalBookings: data.length, revenue: totalRev });
    } catch (fetchError) {
      console.error('Error fetching bookings:', fetchError);
      setError('Failed to load bookings. Check if backend is running on port 5000.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${AUTH_BASE_URL}/me`, {
          credentials: 'include'
        });

        if (!response.ok) {
          setIsAuthenticated(false);
          return;
        }

        const data = await response.json();
        setEmail(data.admin?.email || '');
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!openMenuId) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [openMenuId]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setToast('');
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleLogin = async () => {
    try {
      setIsAuthLoading(true);
      setAuthError('');

      const response = await fetch(`${AUTH_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setEmail(data.admin?.email || email);
      setPassword('');
      setIsAuthenticated(true);
      setToast('Admin session started');
    } catch (loginError) {
      setAuthError(loginError.message || 'Login failed');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${AUTH_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      resetAuthState();
      setEmail('');
      setPassword('');
      setAuthError('');
      setToast('');
    }
  };

  const handleCancelBooking = async (id, reason) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason, sendEmail: true })
      });

      if (res.status === 401 || res.status === 403) {
        handleUnauthorized();
        return;
      }

      if (res.ok) {
        setToast('Booking cancelled successfully');
        setCancellingBooking(null);
        fetchBookings();
      }
    } catch {
      setError('Error cancelling booking');
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete booking');
      }

      setToast('Booking deleted successfully');
      setOpenMenuId(null);
      fetchBookings();
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete booking');
    }
  };

  const openEditModal = (booking) => {
    setOpenMenuId(null);
    setEditingBooking(booking);
    setEditForm({
      customerName: booking.customerName || '',
      phone: booking.phone || '',
      email: booking.email || '',
      date: booking.date ? booking.date.split('T')[0] : '',
      startTime: booking.startTime || '',
      endTime: booking.endTime || ''
    });
  };

  const closeEditModal = () => {
    if (isSavingEdit) {
      return;
    }

    setEditingBooking(null);
  };

  const handleSaveBookingUpdate = async () => {
    if (!editingBooking) {
      return;
    }

    try {
      setIsSavingEdit(true);
      const res = await fetch(`${API_BASE_URL}/${editingBooking._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      if (res.status === 401 || res.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update booking');
      }

      setToast('Booking updated successfully');
      setEditingBooking(null);
      fetchBookings();
    } catch (updateError) {
      setError(updateError.message || 'Failed to update booking');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleTogglePaymentStatus = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}/payment-status`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update payment status');
      }

      setToast(data.message || 'Payment status updated');
      setOpenMenuId(null);
      fetchBookings();
    } catch (statusError) {
      setError(statusError.message || 'Failed to update payment status');
    }
  };

  const bookingsByDate = useMemo(() => {
    const grouped = {};
    bookings.forEach((booking) => {
      if (booking.status === 'cancelled') return;
      const dateKey = booking.date.split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(booking);
    });
    return grouped;
  }, [bookings]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-deep-charcoal px-4 sm:px-6 lg:px-8 pt-24 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#151515] p-6 sm:p-8 rounded-2xl border border-white/10 text-center">
          <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-gold" />
          <p className="font-bebas text-2xl tracking-wide text-vintage-cream">Checking Session</p>
          <p className="mt-2 text-sm text-white/60">Hold tight while we verify your admin access.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-deep-charcoal px-4 sm:px-6 lg:px-8 pt-24 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#151515] p-6 sm:p-8 rounded-2xl border border-white/10 text-center">
          <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-gold" />
          <h2 className="text-3xl font-bebas text-vintage-cream mb-6">Admin Login</h2>
          {authError && (
            <div className="mb-4 rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">
              {authError}
            </div>
          )}
          <input
            type="email"
            placeholder="Admin Email"
            className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-red-600 text-center"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Admin Password"
            className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-red-600 text-center"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-gold"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPassword ? 'Hide Password' : 'Show Password'}
          </button>
          <button
            className={`w-full py-3 rounded-xl font-bebas text-xl tracking-wider transition-colors ${isAuthLoading ? 'bg-red-900/60 text-white/60 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
            onClick={handleLogin}
            disabled={isAuthLoading}
          >
            {isAuthLoading ? 'VERIFYING...' : 'LOGIN'}
          </button>
          <p className="mt-4 text-xs text-white/40">
            Credentials now come from your backend environment instead of frontend hardcoding.
          </p>
        </div>
      </div>
    );
  }

  const previousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
  const calendarDates = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDates.push({ day: '', dateString: '', isCurrentMonth: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const ds = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDates.push({ day: i, dateString: ds, isCurrentMonth: true });
  }

  const openBookingsPanel = (dateString) => {
    setSelectedDate(dateString);
    setIsPanelOpen(true);
  };

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="min-h-screen bg-black px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 pt-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-4xl font-bebas text-vintage-cream tracking-wide">Admin Dashboard</h1>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 px-4 py-2 bg-zinc-900 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('Overview')}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded ${activeTab === 'Overview' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-white'}`}
            >
              OVERVIEW
            </button>
            <button
              onClick={() => setActiveTab('Calendar')}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded ${activeTab === 'Calendar' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-white'}`}
            >
              CALENDAR
            </button>
            <button onClick={() => fetchBookings()} className="p-2 hover:bg-zinc-800 rounded text-white hidden sm:block">
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to="/admin/manage-admins"
              className="rounded bg-gold/10 px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-gold transition-colors hover:bg-gold/20"
            >
              Add Admin
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded bg-zinc-800 px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-zinc-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium shadow-xl z-50 flex items-center space-x-2">
            <CheckCircle size={20} />
            <span>{toast}</span>
          </div>
        )}

        <AnimatePresence>
          {editingBooking && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-2xl rounded-3xl border border-[#5f4732] bg-[linear-gradient(180deg,rgba(35,24,16,0.98),rgba(16,16,16,0.98))] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.55)]"
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bebas text-3xl tracking-wide text-vintage-cream">Edit Booking</p>
                    <p className="text-sm text-white/55">Reschedule or correct the guest details. The backend still blocks overlaps.</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="rounded-full border border-white/10 bg-black/20 p-2 text-white/60 transition-colors hover:text-white"
                    aria-label="Close edit booking modal"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={editForm.customerName}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, customerName: event.target.value }))}
                    placeholder="Customer name"
                    className="w-full rounded-xl border border-white/10 bg-[#1b1b1b] px-4 py-3 text-white focus:border-gold focus:outline-none"
                  />
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="Phone number"
                    className="w-full rounded-xl border border-white/10 bg-[#1b1b1b] px-4 py-3 text-white focus:border-gold focus:outline-none"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="Email"
                    className="w-full rounded-xl border border-white/10 bg-[#1b1b1b] px-4 py-3 text-white focus:border-gold focus:outline-none md:col-span-2"
                  />
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, date: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-[#1b1b1b] px-4 py-3 text-white focus:border-gold focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-4 md:col-span-2">
                    <input
                      type="text"
                      value={editForm.startTime}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, startTime: event.target.value }))}
                      placeholder="10:00 AM"
                      className="w-full rounded-xl border border-white/10 bg-[#1b1b1b] px-4 py-3 text-white focus:border-gold focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editForm.endTime}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, endTime: event.target.value }))}
                      placeholder="01:00 PM"
                      className="w-full rounded-xl border border-white/10 bg-[#1b1b1b] px-4 py-3 text-white focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/20 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBookingUpdate}
                    disabled={isSavingEdit}
                    className={`rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition-colors ${isSavingEdit ? 'bg-gold/30 text-black/50' : 'bg-gold text-black hover:bg-[#f0c24f]'}`}
                  >
                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {activeTab === 'Overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 w-full">
              {[
                { label: 'Total Bookings', value: dbStats.totalBookings, icon: <CalendarIcon className="text-red-500" /> },
                { label: 'Total Revenue', value: `₹${dbStats.revenue.toLocaleString()}`, icon: <IndianRupee className="text-red-500" /> },
                { label: 'Conversion Rate', value: '8.4%', icon: <TrendingUp className="text-red-500" /> },
                { label: 'Active Guests', value: dbStats.totalBookings > 0 ? '12' : '0', icon: <Users className="text-red-500" /> }
              ].map((stat, i) => (
                <div key={i} className="rounded-lg bg-zinc-900 p-4 sm:p-6 border border-zinc-800">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-zinc-400 text-sm font-inter">{stat.label}</p>
                    {stat.icon}
                  </div>
                  <h3 className="text-4xl font-bebas text-white tracking-widest">{stat.value}</h3>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white uppercase">Recent Bookings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold">ID</th>
                      <th className="p-4 font-semibold">Customer</th>
                      <th className="p-4 font-semibold">Date & Time</th>
                      <th className="p-4 font-semibold">Package</th>
                      <th className="p-4 font-semibold">Amount</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {isLoading ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-zinc-500">
                          Loading backend data...
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => {
                        const displayDate = new Date(booking.date).toLocaleDateString() || 'N/A';
                        const isCancelled = booking.status === 'cancelled';
                        const isMenuOpen = openMenuId === booking._id;
                        const paymentLabel = booking.paymentStatus === 'completed' ? 'Set as Pending' : 'Set as Completed';

                        return (
                          <tr
                            key={booking._id}
                            className={`hover:bg-zinc-800/50 transition-colors text-zinc-300 text-sm ${isCancelled ? 'opacity-40 grayscale' : ''}`}
                          >
                            <td className="p-4 font-mono text-xs">HOC-{booking._id.slice(-5).toUpperCase()}</td>
                            <td className="p-4 font-medium">{booking.customerName}</td>
                            <td className="p-4 text-zinc-400">
                              {displayDate} <br /> {booking.startTime} - {booking.endTime}
                            </td>
                            <td className="p-4 capitalize">{booking.roomType}</td>
                            <td className="p-4 font-bold text-red-500">₹{booking.totalAmount}</td>
                            <td className="p-4 capitalize">
                              <div className="flex flex-col gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-semibold w-fit ${isCancelled ? 'bg-red-900/30 text-red-500' : 'bg-green-900/30 text-green-500'}`}>
                                  {booking.status}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-semibold w-fit ${booking.paymentStatus === 'completed' ? 'bg-amber-400/15 text-amber-300 border border-amber-400/20' : 'bg-white/5 text-zinc-300 border border-white/10'}`}>
                                  Payment: {booking.paymentStatus}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="relative inline-flex" ref={isMenuOpen ? menuRef : null}>
                                <button
                                  type="button"
                                  onClick={() => setOpenMenuId(isMenuOpen ? null : booking._id)}
                                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-[#1c1c1c] p-2 text-vintage-cream shadow-[0_0_18px_rgba(0,0,0,0.25)] transition-colors hover:border-marquee-red/40 hover:bg-[#252525]"
                                  aria-label="Booking actions"
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {isMenuOpen && (
                                  <div className="absolute right-0 top-12 z-20 min-w-52 overflow-hidden rounded-2xl border border-[#5f4732] bg-[linear-gradient(180deg,rgba(42,31,22,0.98),rgba(18,18,18,0.98))] shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-md">
                                    <div className="border-b border-[#5f4732]/60 px-4 py-3 text-left">
                                      <p className="font-bebas text-lg tracking-wider text-vintage-cream">Booking Actions</p>
                                      <p className="text-xs uppercase tracking-[0.25em] text-gold/70">Projection Booth</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => openEditModal(booking)}
                                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-vintage-cream transition-colors hover:bg-white/5"
                                    >
                                      <Pencil size={16} className="text-gold" />
                                      <span>Edit / Reschedule</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteBooking(booking._id)}
                                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-200 transition-colors hover:bg-red-500/10"
                                    >
                                      <Trash2 size={16} className="text-red-400" />
                                      <span>Delete Booking</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleTogglePaymentStatus(booking._id)}
                                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-vintage-cream transition-colors hover:bg-gold/10"
                                    >
                                      <CreditCard size={16} className="text-gold" />
                                      <span>{paymentLabel}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                    {!isLoading && bookings.length === 0 && (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-zinc-500">
                          No bookings yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'Calendar' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="max-w-4xl mx-auto bg-zinc-900 rounded-xl p-4 sm:p-6 border border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white uppercase">Interactive Calendar</h2>
                <div className="flex items-center gap-4">
                  <button onClick={previousMonth} className="text-zinc-400 hover:text-white px-2">
                    &lt;
                  </button>
                  <span className="text-red-500 font-bold text-sm sm:text-base uppercase">
                    {monthName} {currentYear}
                  </span>
                  <button onClick={nextMonth} className="text-zinc-400 hover:text-white px-2">
                    &gt;
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                  <div key={day} className="text-center text-xs sm:text-sm text-zinc-500 font-semibold">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDates.map((date, index) => {
                  const hasBookings = bookingsByDate[date.dateString]?.length > 0;
                  const bookingCount = bookingsByDate[date.dateString]?.length || 0;

                  if (!date.isCurrentMonth) {
                    return <div key={`empty-${index}`} className="aspect-square bg-zinc-800/20 rounded-lg" />;
                  }

                  return (
                    <div
                      key={index}
                      onClick={() => hasBookings && openBookingsPanel(date.dateString)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 ${hasBookings ? 'bg-red-600 text-white cursor-pointer hover:bg-red-700 hover:scale-105' : 'bg-zinc-800 text-zinc-600 cursor-default'}`}
                    >
                      <span className="text-base sm:text-lg">{date.day}</span>
                      {hasBookings && (
                        <span className="text-[10px] sm:text-xs mt-0.5 opacity-90 text-center leading-tight hidden xs:block">
                          {bookingCount} <br className="sm:hidden" />
                          <span className="hidden sm:inline">{bookingCount === 1 ? 'booking' : 'bookings'}</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isPanelOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <div onClick={() => setIsPanelOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full sm:w-96 h-full bg-zinc-900 shadow-2xl overflow-y-auto border-l border-zinc-800"
            >
              <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <p className="text-sm text-zinc-400">{bookingsByDate[selectedDate]?.length || 0} bookings</p>
                </div>
                <button onClick={() => setIsPanelOpen(false)} className="text-zinc-400 hover:text-white text-3xl font-light leading-none">
                  &times;
                </button>
              </div>

              <div className="p-4 space-y-3">
                {bookingsByDate[selectedDate]?.map((booking) => (
                  <div key={booking._id} className="bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                    <div
                      onClick={() => setExpandedBookingId(expandedBookingId === booking._id ? null : booking._id)}
                      className="p-4 cursor-pointer hover:bg-zinc-750 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">
                            {booking.startTime} - {booking.endTime}
                          </p>
                          <p className="text-sm text-zinc-400 capitalize">{booking.roomType} Package</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-500">₹{booking.totalAmount}</p>
                          <p className="text-xs text-zinc-500">{booking.duration}hrs</p>
                        </div>
                      </div>
                    </div>

                    {expandedBookingId === booking._id && (
                      <div className="px-4 pb-4 border-t border-zinc-700 pt-3 space-y-2 bg-zinc-800/50">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 text-sm w-16">Name:</span>
                          <span className="text-white font-medium">{booking.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 text-sm w-16">Phone:</span>
                          <span className="text-white">{booking.phone}</span>
                        </div>
                        {booking.addons?.length > 0 && (
                          <div className="mt-2">
                            <span className="text-zinc-500 text-sm">Add-ons:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {booking.addons.map((addon, i) => (
                                <span key={i} className="text-xs bg-zinc-700 px-2 py-1 rounded text-zinc-300 capitalize border border-zinc-600">
                                  {addon}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => openEditModal(booking)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCancellingBooking(booking);
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {cancellingBooking && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCancellingBooking(null)} />
          <div className="bg-[#151515] p-6 sm:p-8 rounded-xl w-full max-w-md relative z-10 border border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.15)]">
            <div className="flex items-center space-x-3 mb-6 text-red-500">
              <AlertTriangle size={28} />
              <h3 className="text-2xl font-bold uppercase">Cancel Booking?</h3>
            </div>

            <div className="bg-[#222] p-4 rounded-lg mb-6 text-sm text-zinc-300 border border-zinc-800">
              <p><span className="text-zinc-500 w-16 inline-block">Client:</span> {cancellingBooking.customerName}</p>
              <p><span className="text-zinc-500 w-16 inline-block">Date:</span> {new Date(cancellingBooking.date).toLocaleDateString()}</p>
              <p><span className="text-zinc-500 w-16 inline-block">Time:</span> {cancellingBooking.startTime} - {cancellingBooking.endTime}</p>
            </div>

            <div className="mb-8">
              <label className="block text-zinc-400 mb-2 text-sm">Reason (Optional)</label>
              <textarea id="cancelReason" className="w-full bg-[#111] border border-zinc-800 rounded-lg p-3 text-white focus:border-red-500 outline-none transition-colors" rows="3" />

              <label className="flex items-center space-x-3 mt-4 text-zinc-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-red-600 rounded" />
                <span className="text-sm">Send cancellation email</span>
              </label>
            </div>

            <div className="flex space-x-3">
              <button onClick={() => setCancellingBooking(null)} className="flex-1 py-3 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors">
                Abort
              </button>
              <button
                onClick={() => {
                  handleCancelBooking(cancellingBooking._id, document.getElementById('cancelReason').value);
                  setIsPanelOpen(false);
                }}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
