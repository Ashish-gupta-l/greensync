import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import {
  HiEye, HiEyeOff, HiLockClosed, HiMail, HiUser, HiIdentification,
  HiArrowRight, HiSparkles, HiCheck
} from 'react-icons/hi';
import {
  HiAcademicCap, HiDocumentText, HiCloudUpload,
  HiLightningBolt, HiShieldCheck
} from 'react-icons/hi';
import { GiTreeBranch } from 'react-icons/gi';
import { FaLeaf, FaRecycle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

// ─── Role Config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  student: {
    title: 'Welcome back,',
    titleAccent: 'Student',
    subtitle: 'Access your assignments and submit work seamlessly.',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    gradientBg: 'from-emerald-600 to-teal-700',
    btnGrad: 'from-emerald-500 to-teal-600',
    ring: 'focus:ring-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    icon: '🎓',
    otherLinks: [
      { to: '/login/teacher', label: 'Teacher Portal', emoji: '📚' },
      { to: '/login/admin', label: 'Admin Portal', emoji: '⚙️' },
    ],
  },
  teacher: {
    title: 'Welcome back,',
    titleAccent: 'Educator',
    subtitle: 'Manage your classes and grade submissions with ease.',
    gradient: 'from-blue-500 via-indigo-500 to-violet-500',
    gradientBg: 'from-blue-600 to-indigo-700',
    btnGrad: 'from-blue-500 to-indigo-600',
    ring: 'focus:ring-blue-400',
    badge: 'bg-blue-500/10 text-blue-600 border-blue-200',
    icon: '📚',
    otherLinks: [
      { to: '/login/student', label: 'Student Portal', emoji: '🎓' },
      { to: '/login/admin', label: 'Admin Portal', emoji: '⚙️' },
    ],
  },
  admin: {
    title: 'Welcome back,',
    titleAccent: 'Admin',
    subtitle: 'Oversee the entire GreenSync academic platform.',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    gradientBg: 'from-violet-600 to-purple-700',
    btnGrad: 'from-violet-500 to-purple-600',
    ring: 'focus:ring-violet-400',
    badge: 'bg-violet-500/10 text-violet-600 border-violet-200',
    icon: '⚙️',
    otherLinks: [
      { to: '/login/student', label: 'Student Portal', emoji: '🎓' },
      { to: '/login/teacher', label: 'Teacher Portal', emoji: '📚' },
    ],
  },
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
function CountUp({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Floating Icon ────────────────────────────────────────────────────────────
function FloatingIcon({ icon: Icon, className, delay = 0, style }) {
  return (
    <motion.div
      className={`absolute flex items-center justify-center rounded-2xl glass ${className}`}
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
        style={style}
      >
        <Icon className="text-white/90" />
      </motion.div>
    </motion.div>
  );
}

// ─── Particle ─────────────────────────────────────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 6 + Math.random() * 10,
    delay: Math.random() * 8,
    opacity: 0.2 + Math.random() * 0.5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            bottom: '-10px',
            opacity: 0,
          }}
          animate={{
            y: [0, -(window.innerHeight + 60)],
            opacity: [0, p.opacity, p.opacity, 0],
            scale: [0.5, 1, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Orb Background ──────────────────────────────────────────────────────────
function OrbBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(52,211,153,0.25) 0%, transparent 70%)',
          top: '-100px',
          left: '-100px',
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 70%)',
          bottom: '-80px',
          right: '-80px',
        }}
        animate={{ x: [0, -30, 20, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(163,230,53,0.15) 0%, transparent 70%)',
          top: '40%',
          left: '30%',
        }}
        animate={{ x: [0, 30, -15, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />
    </div>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────
function InputField({ label, icon: Icon, type, value, onChange, placeholder, required, minLength, error, rightSlot }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5 tracking-wide">
        {label}
      </label>
      <div className={`relative flex items-center rounded-xl border-2 transition-all duration-200 bg-gray-50/80
        ${focused
          ? 'border-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.15)] bg-white'
          : error
            ? 'border-red-300 bg-white'
            : 'border-gray-200 hover:border-gray-300'
        }
      `}>
        <Icon className={`absolute left-3.5 text-lg transition-colors duration-200 ${focused ? 'text-emerald-500' : 'text-gray-400'}`} />
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full pl-11 pr-11 py-3.5 bg-transparent text-gray-900 placeholder-gray-400 text-sm font-medium rounded-xl focus:outline-none"
        />
        {rightSlot && (
          <div className="absolute right-3.5">{rightSlot}</div>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
        >
          <span className="w-1 h-1 bg-red-500 rounded-full inline-block" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ─── Testimonial data ─────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'CS Student, IIT Delhi',
    text: 'GreenSync made submitting assignments so seamless. Love the eco-impact tracking!',
    avatar: 'PS',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    name: 'Dr. Rajesh Kumar',
    role: 'Professor, BITS Pilani',
    text: 'The grading dashboard is incredibly intuitive. A must-have for modern educators.',
    avatar: 'RK',
    color: 'from-blue-400 to-indigo-500',
  },
  {
    name: 'Ananya Mishra',
    role: 'BTech, NIT Trichy',
    text: 'Finally a platform that cares about the environment AND academics. Brilliant!',
    avatar: 'AM',
    color: 'from-violet-400 to-purple-500',
  },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const LoginPage = ({ role }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const cfg = ROLE_CONFIG[role];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const resetForm = () => {
    setEmail(''); setPassword(''); setName('');
    setRollNumber(''); setDepartment(''); setConfirm('');
    setShowPwd(false);
  };

  const switchMode = (m) => { resetForm(); setMode(m); };

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== role) {
        toast.error(`This is the ${role} portal. Please use the ${user.role} portal.`);
        return;
      }
      setLoginSuccess(true);
      toast.success(`Welcome back, ${user.name}! 🌿`);
      setTimeout(() => navigate(`/${user.role}`), 800);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up ────────────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const user = await register({ name, email, password, role, rollNumber, department });
      setLoginSuccess(true);
      toast.success(`Account created! Welcome, ${user.name}! 🌿`);
      setTimeout(() => navigate(`/${user.role}`), 800);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ══ LEFT HERO PANEL ══════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col"
        style={{
          background: 'linear-gradient(145deg, #022c22 0%, #064e3b 25%, #0d9488 55%, #059669 80%, #047857 100%)',
        }}
      >
        {/* Animated background orbs */}
        <OrbBackground />

        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />

        {/* Particles */}
        <Particles />

        {/* Floating icons */}
        <FloatingIcon
          icon={HiAcademicCap}
          className="w-14 h-14 top-[12%] left-[8%] text-2xl shadow-lg"
          delay={0.2}
        />
        <FloatingIcon
          icon={HiDocumentText}
          className="w-12 h-12 top-[22%] right-[12%] text-xl shadow-lg"
          delay={0.5}
        />
        <FloatingIcon
          icon={FaLeaf}
          className="w-11 h-11 top-[60%] left-[6%] text-xl shadow-lg"
          delay={0.8}
        />
        <FloatingIcon
          icon={HiCloudUpload}
          className="w-13 h-13 top-[70%] right-[15%] text-xl shadow-lg"
          delay={1.1}
        />
        <FloatingIcon
          icon={FaRecycle}
          className="w-10 h-10 top-[42%] right-[5%] text-lg shadow-lg"
          delay={0.4}
        />
        <FloatingIcon
          icon={HiShieldCheck}
          className="w-12 h-12 top-[80%] left-[25%] text-xl shadow-lg"
          delay={1.4}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14 text-white">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
              <GiTreeBranch className="text-white text-2xl" />
            </div>
            <div>
              <span className="font-display font-bold text-2xl tracking-tight">GreenSync</span>
              <span className="block text-white/50 text-[10px] font-medium tracking-widest uppercase -mt-0.5">Academic Hub</span>
            </div>
          </motion.div>

          {/* Main hero text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="my-8"
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-emerald-200 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Smart Academic Platform — Live
            </motion.div>

            <h1 className="font-display font-black text-5xl xl:text-6xl leading-[1.1] mb-5">
              <span className="text-white">Submit Smart.</span>
              <br />
              <span
                className="inline-block"
                style={{
                  background: 'linear-gradient(135deg, #4ade80 0%, #22d3ee 50%, #a3e635 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Go Green. 🌿
              </span>
            </h1>

            <p className="text-white/70 text-lg leading-relaxed max-w-sm font-light">
              Go fully paperless. Submit assignments, get graded, and track your real-time eco-impact — all in one beautiful platform.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-6">
              {['Real-time Grading', 'Eco Tracking', 'AI-Powered', 'Cloud Sync'].map((f, i) => (
                <motion.span
                  key={f}
                  className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-medium text-white/80"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <HiCheck className="text-emerald-400 text-xs" />
                  {f}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: 'Trees Saved', value: 1240, suffix: '+', icon: '🌳' },
                { label: 'Submissions', value: 9800, suffix: '+', icon: '📄' },
                { label: 'CO₂ Reduced', value: 47, suffix: ' kg', icon: '🌍' },
              ].map(({ label, value, suffix, icon }, i) => (
                <motion.div
                  key={label}
                  className="relative rounded-2xl p-4 text-center overflow-hidden cursor-default"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.12)' }}
                >
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="font-display font-bold text-xl text-white">
                    <CountUp end={value} suffix={suffix} />
                  </div>
                  <div className="text-white/55 text-xs mt-0.5 font-medium">{label}</div>
                </motion.div>
              ))}
            </div>

            {/* Testimonial Carousel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                className="relative rounded-2xl p-4 overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${TESTIMONIALS[activeTestimonial].color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg`}>
                    {TESTIMONIALS[activeTestimonial].avatar}
                  </div>
                  <div>
                    <p className="text-white/80 text-sm leading-relaxed italic">
                      "{TESTIMONIALS[activeTestimonial].text}"
                    </p>
                    <div className="mt-2">
                      <span className="text-white font-semibold text-xs">{TESTIMONIALS[activeTestimonial].name}</span>
                      <span className="text-white/50 text-xs"> — {TESTIMONIALS[activeTestimonial].role}</span>
                    </div>
                  </div>
                </div>
                {/* Dots */}
                <div className="flex gap-1.5 mt-3 justify-center">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      className={`h-1 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/30'}`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Footer links */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
              <span className="text-white/30 text-xs">© 2025 GreenSync</span>
              <div className="flex gap-4">
                <span className="text-white/40 text-xs hover:text-white/70 cursor-pointer transition-colors">Privacy</span>
                <span className="text-white/40 text-xs hover:text-white/70 cursor-pointer transition-colors">Terms</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ══ RIGHT FORM PANEL ═════════════════════════════════════════════════ */}
      <div
        className="w-full lg:w-[48%] flex flex-col items-center justify-center p-6 sm:p-8 overflow-y-auto relative"
        style={{ background: 'linear-gradient(160deg, #f8faff 0%, #f0fdf4 40%, #f0fdfa 100%)' }}
      >
        {/* Subtle bg pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(52,211,153,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(20,184,166,0.06) 0%, transparent 50%)',
          }}
        />

        <motion.div
          className="w-full max-w-[420px] relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <GiTreeBranch className="text-white text-xl" />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-gray-900">GreenSync</span>
              <span className="block text-gray-400 text-[10px] font-medium tracking-widest uppercase">Academic Hub</span>
            </div>
          </div>

          {/* Form Card */}
          <div
            className="rounded-3xl p-8 sm:p-9"
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.95)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.10), 0 0 0 1px rgba(255,255,255,0.8), 0 8px 32px rgba(52,211,153,0.06)',
            }}
          >
            {/* Role badge */}
            <motion.div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold border mb-5"
              style={{ background: 'rgba(16,185,129,0.08)', color: '#059669', borderColor: 'rgba(16,185,129,0.2)' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span>{cfg.icon}</span>
              <span className="uppercase tracking-wider">{role} Portal</span>
            </motion.div>

            {/* Header */}
            <div className="mb-7">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 leading-tight">
                {cfg.title}
                <br />
                <span
                  style={{
                    background: `linear-gradient(135deg, #10b981 0%, #0d9488 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {cfg.titleAccent} 👋
                </span>
              </h2>
              <p className="text-gray-500 mt-2 text-sm leading-relaxed">{cfg.subtitle}</p>
            </div>

            {/* ── Tab Toggle ── */}
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-7 relative">
              <motion.div
                className="absolute top-1 bottom-1 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                  width: 'calc(50% - 4px)',
                  left: mode === 'login' ? '4px' : 'calc(50%)',
                }}
                layout
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
              {['login', 'signup'].map((m) => (
                <button
                  key={m}
                  id={`tab-${m}`}
                  onClick={() => switchMode(m)}
                  className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 capitalize
                    ${mode === m ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {m === 'login' ? '🔑 Sign In' : '✨ Sign Up'}
                </button>
              ))}
            </div>

            {/* ── Forms ── */}
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <InputField
                    label="Email Address"
                    icon={HiMail}
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />

                  <InputField
                    label="Password"
                    icon={HiLockClosed}
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowPwd(s => !s)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                        id="toggle-password"
                      >
                        <AnimatePresence mode="wait">
                          {showPwd
                            ? <motion.span key="eye-off" initial={{ scale: 0.5, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.5 }} className="block"><HiEyeOff /></motion.span>
                            : <motion.span key="eye" initial={{ scale: 0.5, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.5 }} className="block"><HiEye /></motion.span>
                          }
                        </AnimatePresence>
                      </button>
                    }
                  />

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    id="btn-signin"
                    disabled={loading || loginSuccess}
                    className="relative w-full py-3.5 px-6 rounded-2xl font-bold text-white text-sm overflow-hidden btn-shimmer mt-2 disabled:cursor-not-allowed"
                    style={{
                      background: loginSuccess
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
                      boxShadow: '0 8px 25px rgba(16,185,129,0.35)',
                    }}
                    whileHover={{ scale: 1.01, boxShadow: '0 12px 35px rgba(16,185,129,0.45)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <AnimatePresence mode="wait">
                      {loginSuccess ? (
                        <motion.span
                          key="success"
                          className="flex items-center justify-center gap-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <HiCheck className="text-xl" /> Success!
                        </motion.span>
                      ) : loading ? (
                        <motion.span key="loading" className="flex items-center justify-center gap-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <Spinner size="sm" color="white" />
                          Signing in...
                        </motion.span>
                      ) : (
                        <motion.span key="idle" className="flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          Sign In <HiArrowRight className="text-base group-hover:translate-x-1 transition-transform" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <p className="text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => switchMode('signup')} className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors hover:underline underline-offset-2">
                      Create one →
                    </button>
                  </p>
                </motion.form>

              ) : (
                /* ── SIGN UP FORM ── */
                <motion.form
                  key="signup-form"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSignup}
                  className="space-y-3.5"
                >
                  <InputField
                    label="Full Name"
                    icon={HiUser}
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Your full name"
                  />

                  <InputField
                    label="Email Address"
                    icon={HiMail}
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />

                  {role === 'student' && (
                    <InputField
                      label={<span>Roll Number <span className="text-gray-400 font-normal text-xs">(optional)</span></span>}
                      icon={HiIdentification}
                      type="text"
                      value={rollNumber}
                      onChange={e => setRollNumber(e.target.value)}
                      placeholder="e.g. CS001"
                    />
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 tracking-wide">
                      Department <span className="text-gray-400 font-normal text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 bg-gray-50/80 text-gray-900 placeholder-gray-400 text-sm font-medium focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.15)] focus:bg-white transition-all duration-200"
                    />
                  </div>

                  <InputField
                    label="Password"
                    icon={HiLockClosed}
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                    rightSlot={
                      <button type="button" onClick={() => setShowPwd(s => !s)} className="text-gray-400 hover:text-gray-600 transition-colors" id="toggle-password-signup">
                        {showPwd ? <HiEyeOff /> : <HiEye />}
                      </button>
                    }
                  />

                  <InputField
                    label="Confirm Password"
                    icon={HiLockClosed}
                    type={showPwd ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    placeholder="Re-enter your password"
                    error={confirm && confirm !== password ? 'Passwords do not match' : null}
                  />

                  <motion.button
                    type="submit"
                    id="btn-signup"
                    disabled={loading || loginSuccess || (confirm && confirm !== password)}
                    className="relative w-full py-3.5 px-6 rounded-2xl font-bold text-white text-sm overflow-hidden btn-shimmer mt-1 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
                      boxShadow: '0 8px 25px rgba(16,185,129,0.35)',
                    }}
                    whileHover={{ scale: 1.01, boxShadow: '0 12px 35px rgba(16,185,129,0.45)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <AnimatePresence mode="wait">
                      {loginSuccess ? (
                        <motion.span key="success" className="flex items-center justify-center gap-2" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <HiCheck className="text-xl" /> Account Created!
                        </motion.span>
                      ) : loading ? (
                        <motion.span key="loading" className="flex items-center justify-center gap-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <Spinner size="sm" color="white" />
                          Creating account...
                        </motion.span>
                      ) : (
                        <motion.span key="idle" className="flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <HiSparkles /> Create Account
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <button type="button" onClick={() => switchMode('login')} className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors hover:underline underline-offset-2">
                      Sign in →
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* ── Other portals ── */}
          <motion.div
            className="mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-center text-gray-400 mb-3 font-medium">Sign in to a different portal</p>
            <div className="flex justify-center gap-2">
              {cfg.otherLinks.map(({ to, label, emoji }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-white/70 transition-all duration-200 font-medium backdrop-blur-sm bg-white/50 shadow-sm"
                >
                  <span>{emoji}</span>
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* ── Demo credentials ── */}
          {mode === 'login' && (
            <motion.div
              className="mt-4 p-4 rounded-2xl border"
              style={{
                background: 'rgba(16,185,129,0.04)',
                borderColor: 'rgba(16,185,129,0.15)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <HiLightningBolt className="text-emerald-500 text-sm" />
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Demo Access — {role}</p>
              </div>
              <div className="font-mono text-xs text-emerald-600 bg-white/60 rounded-lg px-3 py-2 border border-emerald-100">
                {role === 'student' && <><span className="text-gray-500">email: </span>amit@greensync.com<br /><span className="text-gray-500">pass: </span>student123</>}
                {role === 'teacher' && <><span className="text-gray-500">email: </span>priya@greensync.com<br /><span className="text-gray-500">pass: </span>teacher123</>}
                {role === 'admin' && <><span className="text-gray-500">email: </span>admin@greensync.com<br /><span className="text-gray-500">pass: </span>admin123</>}
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Protected by enterprise-grade encryption — 🔒 SSL Secured
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
