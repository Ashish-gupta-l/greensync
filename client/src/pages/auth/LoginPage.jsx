import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiEye, HiEyeOff, HiLockClosed, HiMail, HiUser, HiIdentification } from 'react-icons/hi';
import { GiTreeBranch } from 'react-icons/gi';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
  student: {
    title: 'Student Portal',
    subtitle: 'Access your assignments and submit work',
    gradient: 'from-emerald-500 to-green-700',
    icon: '🎓',
    otherLinks: [
      { to: '/login/teacher', label: 'Teacher Portal' },
      { to: '/login/admin', label: 'Admin Portal' },
    ],
  },
  teacher: {
    title: 'Teacher Portal',
    subtitle: 'Manage your classes and grade submissions',
    gradient: 'from-blue-500 to-indigo-700',
    icon: '📚',
    otherLinks: [
      { to: '/login/student', label: 'Student Portal' },
      { to: '/login/admin', label: 'Admin Portal' },
    ],
  },
  admin: {
    title: 'Admin Portal',
    subtitle: 'Manage the entire platform',
    gradient: 'from-violet-500 to-purple-700',
    icon: '⚙️',
    otherLinks: [
      { to: '/login/student', label: 'Student Portal' },
      { to: '/login/teacher', label: 'Teacher Portal' },
    ],
  },
};

const LoginPage = ({ role }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const cfg = ROLE_CONFIG[role];

  const resetForm = () => {
    setEmail(''); setPassword(''); setName('');
    setRollNumber(''); setDepartment(''); setConfirm('');
    setShowPwd(false);
  };

  const switchMode = (m) => { resetForm(); setMode(m); };

  // ── LOGIN ──────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== role) {
        toast.error(`This is the ${role} portal. Please use the ${user.role} portal.`);
        return;
      }
      toast.success(`Welcome back, ${user.name}! 🌿`);
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ── SIGN UP ────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const user = await register({ name, email, password, role, rollNumber, department });
      toast.success(`Account created! Welcome, ${user.name}! 🌿`);
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Left panel – decorative */}
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br ${cfg.gradient} relative overflow-hidden`}>
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full" />
        <div className="absolute bottom-10 -right-10 w-60 h-60 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <GiTreeBranch className="text-white text-2xl" />
            </div>
            <span className="font-display font-bold text-2xl">GreenSync</span>
          </div>

          {/* Main content */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-6xl mb-6">{cfg.icon}</div>
              <h1 className="font-display font-bold text-4xl leading-tight mb-4">
                Smart Academic<br />Submission Hub
              </h1>
              <p className="text-white/80 text-lg leading-relaxed max-w-sm">
                Go paperless. Save trees. Submit assignments digitally and track your eco-impact in real time.
              </p>
            </motion.div>
          </div>

          {/* Eco stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Trees Saved', value: '1,240+' },
              { label: 'Submissions', value: '9,800+' },
              { label: 'CO₂ Reduced', value: '47 kg' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center">
                <div className="font-display font-bold text-xl text-white">{value}</div>
                <div className="text-white/70 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className={`w-9 h-9 bg-gradient-to-br ${cfg.gradient} rounded-xl flex items-center justify-center`}>
              <GiTreeBranch className="text-white text-xl" />
            </div>
            <span className="font-display font-bold text-xl text-gray-800 dark:text-white">GreenSync</span>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="font-display font-bold text-3xl text-gray-900 dark:text-white">{cfg.title}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{cfg.subtitle}</p>
          </div>

          {/* Mode toggle tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 capitalize
                  ${mode === m
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                {m === 'login' ? '🔑 Sign In' : '✨ Sign Up'}
              </button>
            ))}
          </div>

          {/* ── SIGN IN FORM ── */}
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd ? <HiEyeOff /> : <HiEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r ${cfg.gradient} hover:opacity-90 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg`}
                >
                  {loading ? <Spinner size="sm" color="white" /> : null}
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => switchMode('signup')} className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                    Create one
                  </button>
                </p>
              </motion.form>

            ) : (
              /* ── SIGN UP FORM ── */
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignup}
                className="space-y-4"
              >
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="text" value={name} onChange={e => setName(e.target.value)} required
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Roll Number (student only) */}
                {role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Roll Number <span className="text-gray-400 font-normal">(optional)</span></label>
                    <div className="relative">
                      <HiIdentification className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                      <input
                        type="text" value={rollNumber} onChange={e => setRollNumber(e.target.value)}
                        placeholder="e.g. CS001"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text" value={department} onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                      placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd ? <HiEyeOff /> : <HiEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type={showPwd ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} required
                      placeholder="Re-enter your password"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400
                        ${confirm && confirm !== password ? 'border-red-400 dark:border-red-600' : 'border-gray-200 dark:border-gray-700'}`}
                    />
                  </div>
                  {confirm && confirm !== password && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit" disabled={loading || (confirm && confirm !== password)}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r ${cfg.gradient} hover:opacity-90 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg`}
                >
                  {loading ? <Spinner size="sm" color="white" /> : null}
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchMode('login')} className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                    Sign in
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Other portals */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-center text-gray-400 mb-3">Sign in to a different portal</p>
            <div className="flex justify-center gap-3">
              {cfg.otherLinks.map(({ to, label }) => (
                <Link
                  key={to} to={to}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Demo credentials (only on login tab) */}
          {mode === 'login' && (
            <div className="mt-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
              <p className="text-xs text-primary-700 dark:text-primary-400 font-semibold mb-1">Demo Credentials ({role})</p>
              {role === 'student' && <p className="text-xs text-primary-600 dark:text-primary-500">amit@greensync.com / student123</p>}
              {role === 'teacher' && <p className="text-xs text-primary-600 dark:text-primary-500">priya@greensync.com / teacher123</p>}
              {role === 'admin' && <p className="text-xs text-primary-600 dark:text-primary-500">admin@greensync.com / admin123</p>}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
