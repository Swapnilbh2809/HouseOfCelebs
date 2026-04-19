import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Users,
  KeyRound,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

const AUTH_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`;

const AdminManagement = () => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionAdmin, setSessionAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);

  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [passwordDrafts, setPasswordDrafts] = useState({});

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activePasswordUpdateId, setActivePasswordUpdateId] = useState('');
  const [activeDeleteId, setActiveDeleteId] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [visiblePasswordAdminId, setVisiblePasswordAdminId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAdmins = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch(`${AUTH_BASE_URL}/admins`, {
        credentials: 'include'
      });

      if (response.status === 401 || response.status === 403) {
        navigate('/admin');
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load admins');
      }

      setAdmins(data.admins || []);
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load admins');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${AUTH_BASE_URL}/me`, {
          credentials: 'include'
        });

        if (!response.ok) {
          navigate('/admin');
          return;
        }

        const data = await response.json();
        setSessionAdmin(data.admin || null);
        setIsAuthenticated(true);
      } catch {
        navigate('/admin');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdmins();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!success && !error) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSuccess('');
      setError('');
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [success, error]);

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    try {
      setIsCreating(true);
      setError('');
      setSuccess('');

      const response = await fetch(`${AUTH_BASE_URL}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: createEmail, password: createPassword })
      });

      const data = await response.json();
      if (response.status === 401 || response.status === 403) {
        navigate('/admin');
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create admin');
      }

      setSuccess(`Admin created for ${data.admin.email}`);
      setCreateEmail('');
      setCreatePassword('');
      fetchAdmins();
    } catch (submitError) {
      setError(submitError.message || 'Failed to create admin');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePasswordChange = async (adminId, adminEmail) => {
    const password = passwordDrafts[adminId] || '';

    try {
      setActivePasswordUpdateId(adminId);
      setError('');
      setSuccess('');

      const response = await fetch(`${AUTH_BASE_URL}/admins/${adminId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password })
      });

      const data = await response.json();
      if (response.status === 401 || response.status === 403) {
        navigate('/admin');
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      setPasswordDrafts((prev) => ({ ...prev, [adminId]: '' }));
      setSuccess(`Password updated for ${adminEmail}`);
    } catch (updateError) {
      setError(updateError.message || 'Failed to update password');
    } finally {
      setActivePasswordUpdateId('');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      setActiveDeleteId(adminId);
      setError('');
      setSuccess('');

      const response = await fetch(`${AUTH_BASE_URL}/admins/${adminId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (response.status === 401 || response.status === 403) {
        navigate('/admin');
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete admin');
      }

      setSuccess(data.message || 'Admin deleted successfully');
      fetchAdmins();
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete admin');
    } finally {
      setActiveDeleteId('');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${AUTH_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      navigate('/admin');
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-deep-charcoal px-4 pt-32 flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#151515] p-8 text-center">
          <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-gold" />
          <p className="font-bebas text-3xl tracking-wide text-vintage-cream">Checking Access</p>
          <p className="mt-2 text-sm text-white/60">Making sure the projection booth is secure.</p>
        </div>
      </div>
    );
  }

  const confirmDeleteAdmin = async () => {
    if (!deleteTarget) {
      return;
    }

    await handleDeleteAdmin(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(211,47,47,0.15),transparent_28%),linear-gradient(180deg,#090909_0%,#151515_55%,#0c0c0c_100%)] px-4 pt-32 pb-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gold/70">Admin Controls</p>
            <h1 className="mt-2 font-bebas text-5xl tracking-wide text-vintage-cream">Admin Control Room</h1>
            <p className="mt-2 text-sm text-white/60">Signed in as {sessionAdmin?.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-gold/40 hover:bg-white/10"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/20"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {(error || success) && (
          <div className={`mb-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm ${error ? 'border border-red-500/40 bg-red-500/10 text-red-200' : 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-200'}`}>
            {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{error || success}</span>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-[2rem] border border-[#5f4732] bg-[linear-gradient(180deg,rgba(34,24,17,0.95),rgba(15,15,15,0.97))] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="border-b border-[#5f4732]/60 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-gold/30 bg-gold/10 p-3">
                  <UserPlus className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <p className="font-bebas text-3xl tracking-wide text-vintage-cream">Create Admin</p>
                  <p className="text-sm text-white/60">Add a new projection booth operator.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-6 px-8 py-8">
              <div>
                <label className="mb-2 block text-sm uppercase tracking-[0.25em] text-gold/80">Admin Email</label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(event) => setCreateEmail(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#181818] px-5 py-4 text-white outline-none transition-colors focus:border-gold/50"
                  placeholder="manager@houseofcelebs.com"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm uppercase tracking-[0.25em] text-gold/80">Password</label>
                <input
                  type={showCreatePassword ? 'text' : 'password'}
                  value={createPassword}
                  onChange={(event) => setCreatePassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#181818] px-5 py-4 text-white outline-none transition-colors focus:border-gold/50"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword((prev) => !prev)}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-gold"
                >
                  {showCreatePassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showCreatePassword ? 'Hide Password' : 'Show Password'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-4 font-bebas text-xl tracking-wider transition-all ${isCreating ? 'cursor-not-allowed bg-red-900/60 text-white/50' : 'bg-marquee-red text-white shadow-[0_0_25px_rgba(211,47,47,0.35)] hover:bg-red-600'}`}
              >
                <UserPlus size={20} />
                {isCreating ? 'CREATING...' : 'CREATE ADMIN'}
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.96),rgba(10,10,10,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-gold/30 bg-gold/10 p-3">
                  <Users className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <p className="font-bebas text-3xl tracking-wide text-vintage-cream">Existing Admins</p>
                  <p className="text-sm text-white/60">Manage accounts and credentials from one screen.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchAdmins}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition-colors hover:bg-white/10"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            <div className="space-y-4 px-6 py-6">
              {admins.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-6 text-center text-white/60">
                  No admins found.
                </div>
              )}

              {admins.map((admin) => {
                const isSelf = sessionAdmin?.id === admin.id;
                const passwordDraft = passwordDrafts[admin.id] || '';

                return (
                  <div key={admin.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-bebas text-2xl tracking-wide text-vintage-cream">{admin.email}</p>
                        <p className="text-xs uppercase tracking-[0.3em] text-gold/70">
                          {admin.role} {isSelf ? '• Current Session' : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ id: admin.id, email: admin.email })}
                        disabled={isSelf || activeDeleteId === admin.id}
                        className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${isSelf ? 'cursor-not-allowed border border-white/10 bg-white/5 text-white/30' : 'border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20'}`}
                      >
                        <Trash2 size={14} />
                        {activeDeleteId === admin.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-gold/80">New Password</label>
                        <input
                          type={visiblePasswordAdminId === admin.id ? 'text' : 'password'}
                          value={passwordDraft}
                          onChange={(event) =>
                            setPasswordDrafts((prev) => ({
                              ...prev,
                              [admin.id]: event.target.value
                            }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 text-white outline-none transition-colors focus:border-gold/50"
                          placeholder="Enter a new password"
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setVisiblePasswordAdminId((prev) => (prev === admin.id ? '' : admin.id))
                          }
                          className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-gold"
                        >
                          {visiblePasswordAdminId === admin.id ? <EyeOff size={14} /> : <Eye size={14} />}
                          {visiblePasswordAdminId === admin.id ? 'Hide Password' : 'Show Password'}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePasswordChange(admin.id, admin.email)}
                        disabled={!passwordDraft || passwordDraft.length < 8 || activePasswordUpdateId === admin.id}
                        className={`mt-auto inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold transition-colors ${!passwordDraft || passwordDraft.length < 8 || activePasswordUpdateId === admin.id ? 'cursor-not-allowed bg-white/5 text-white/30' : 'bg-gold/15 text-gold hover:bg-gold/25'}`}
                      >
                        <KeyRound size={16} />
                        {activePasswordUpdateId === admin.id ? 'Updating...' : 'Change Password'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-red-500/30 bg-[linear-gradient(180deg,rgba(34,18,18,0.98),rgba(12,12,12,0.98))] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            <div className="mb-5 flex items-center gap-3 text-red-300">
              <div className="rounded-full border border-red-500/30 bg-red-500/10 p-3">
                <Trash2 size={22} />
              </div>
              <div>
                <p className="font-bebas text-3xl tracking-wide text-vintage-cream">Delete Admin?</p>
                <p className="text-sm text-white/60">This removes access for the selected account.</p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/75">
              <span className="text-gold/80">Admin email:</span> {deleteTarget.email}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAdmin}
                disabled={activeDeleteId === deleteTarget.id}
                className={`flex-1 rounded-full px-5 py-3 font-semibold transition-colors ${activeDeleteId === deleteTarget.id ? 'cursor-not-allowed bg-red-900/50 text-white/40' : 'bg-red-600 text-white hover:bg-red-700'}`}
              >
                {activeDeleteId === deleteTarget.id ? 'Deleting...' : 'Delete Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
