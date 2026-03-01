import { useEffect, useState, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion, useInView, animate, AnimatePresence } from 'framer-motion';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';
import {
  HiLightningBolt, HiClipboardList, HiCheckCircle,
  HiClock, HiExclamation, HiArrowRight, HiBookOpen,
  HiSparkles, HiTrendingUp, HiChevronRight
} from 'react-icons/hi';
import { GiTreeBranch } from 'react-icons/gi';
import SubjectCard from '../../components/common/SubjectCard';
import Spinner from '../../components/ui/Spinner';
import { assignmentAPI, submissionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/* ─────────────────────────────────────────
   Animated Counter Hook
───────────────────────────────────────── */
function useCountUp(target, duration = 1.5) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setCount(Math.round(v * 100) / 100),
    });
    return controls.stop;
  }, [inView, target, duration]);

  return { count, ref };
}

/* ─────────────────────────────────────────
   Shimmer Loading Card
───────────────────────────────────────── */
const ShimmerCard = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-card overflow-hidden relative">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]
      bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 mb-3" />
    <div className="h-7 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg mb-2" />
    <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
  </div>
);

/* ─────────────────────────────────────────
   Stat Card
───────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, gradient, delay }) {
  const { count, ref } = useCountUp(value, 1.2);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-card
        hover:shadow-xl transition-shadow duration-300 cursor-default overflow-hidden"
    >
      {/* Glow blob */}
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 blur-xl ${gradient}`} />

      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${gradient}
        group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="text-white text-xl" />
      </div>

      <div className="font-display font-extrabold text-3xl text-gray-900 dark:text-white tracking-tight">
        {label === 'Trees Saved' ? count.toFixed(2) : Math.round(count)}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 ${gradient}`} />
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Eco Impact Banner
───────────────────────────────────────── */
const FloatingLeaf = ({ style }) => (
  <motion.div
    style={style}
    animate={{ y: [-8, 8, -8], rotate: [-10, 10, -10], opacity: [0.4, 0.7, 0.4] }}
    transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' }}
    className="absolute text-2xl pointer-events-none select-none"
  >
    🍃
  </motion.div>
);

function EcoBanner({ totalSubmissions = 0 }) {
  const pages = totalSubmissions * 5;
  const trees = parseFloat((pages / 8000).toFixed(2));
  const co2 = parseFloat((totalSubmissions * 0.02).toFixed(1));

  const { count: treeCount, ref: treeRef } = useCountUp(trees, 2);
  const { count: pageCount, ref: pageRef } = useCountUp(pages, 2);
  const { count: co2Count, ref: co2Ref } = useCountUp(co2, 2);

  const progress = Math.min(100, (totalSubmissions / 50) * 100);

  const leaves = [
    { top: '10%', left: '5%' }, { top: '60%', left: '12%' },
    { top: '20%', right: '8%' }, { top: '70%', right: '15%' },
    { top: '40%', left: '45%' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl p-6 text-white mb-2"
      style={{
        background: 'linear-gradient(135deg, #059669 0%, #10b981 35%, #0d9488 70%, #0891b2 100%)',
      }}
    >
      {/* Animated gradient overlay */}
      <motion.div
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(270deg, #34d399, #06b6d4, #10b981, #6ee7b7)',
          backgroundSize: '400% 400%',
        }}
      />

      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      {/* Floating leaves */}
      {leaves.map((s, i) => <FloatingLeaf key={i} style={{ position: 'absolute', ...s }} />)}

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        {/* Left */}
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
          >
            <GiTreeBranch className="text-3xl text-white" />
          </motion.div>
          <div>
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              Your Eco Impact <HiSparkles className="text-yellow-300 animate-pulse" />
            </h2>
            <p className="text-white/80 text-sm mt-0.5">Every digital submission saves paper 🌍</p>
            {/* Progress bar */}
            <div className="mt-2.5 w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                className="h-full bg-yellow-300 rounded-full"
              />
            </div>
            <p className="text-white/60 text-xs mt-1">{totalSubmissions}/50 submissions milestone</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-5">
          {[
            { label: 'Trees Saved', value: treeCount.toFixed(2), ref: treeRef, emoji: '🌳' },
            { label: 'Pages Saved', value: Math.round(pageCount).toLocaleString(), ref: pageRef, emoji: '📄' },
            { label: 'CO₂ Reduced', value: `${co2Count.toFixed(1)} kg`, ref: co2Ref, emoji: '💨' },
          ].map(({ label, value, ref, emoji }) => (
            <motion.div
              key={label}
              ref={ref}
              whileHover={{ scale: 1.05 }}
              className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 cursor-default"
            >
              <div className="text-lg mb-0.5">{emoji}</div>
              <div className="font-display font-bold text-2xl">{value}</div>
              <div className="text-white/70 text-xs mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Todo Item
───────────────────────────────────────── */
function TodoItem({ assignment, subjectName, index }) {
  const deadline = new Date(assignment.deadline);
  const overdue = isPast(deadline);
  const urgent = !overdue && deadline - new Date() < 24 * 3600 * 1000;

  const statusColor = overdue
    ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
    : urgent
      ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/10'
      : 'border-emerald-300 dark:border-gray-600 bg-transparent';

  const dotColor = overdue ? 'bg-red-400' : urgent ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ x: 3, transition: { duration: 0.15 } }}
      className={`group flex items-start gap-3 p-3 rounded-xl border ${statusColor}
        transition-all duration-200 mb-2 cursor-default`}
    >
      {/* Dot indicator */}
      <div className="mt-0.5 flex-shrink-0">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColor} ring-2 ring-offset-1
          ring-offset-white dark:ring-offset-gray-900
          ${overdue ? 'ring-red-200' : urgent ? 'ring-amber-200' : 'ring-emerald-200'}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {assignment.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subjectName}</p>
      </div>

      <div className="flex-shrink-0 flex items-center gap-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full
          ${overdue
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            : urgent
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          }`}>
          {overdue ? '⚠ Overdue' : format(deadline, 'MMM d')}
        </span>
        <HiChevronRight className="text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm" />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────── */
export default function StudentDashboard() {
  const { user } = useAuth();
  const { subjects = [] } = useOutletContext() || {};

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignCounts, setAssignCounts] = useState({});

  useEffect(() => {
    Promise.all([assignmentAPI.getAll(), submissionAPI.getMy()])
      .then(([aRes, sRes]) => {
        const allAssign = aRes.data.assignments || [];
        setAssignments(allAssign);
        setSubmissions(sRes.data.submissions || []);
        const counts = {};
        allAssign.forEach(a => {
          const sid = a.subject?._id || a.subject;
          counts[sid] = (counts[sid] || 0) + 1;
        });
        setAssignCounts(counts);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const submittedIds = new Set(submissions.map(s => s.assignment?._id || s.assignment));
  const pendingAssignments = assignments.filter(a => !submittedIds.has(a._id));
  const overdueCount = pendingAssignments.filter(a => isPast(new Date(a.deadline))).length;

  const stats = [
    {
      icon: HiBookOpen,
      label: 'Enrolled Subjects',
      value: subjects.length,
      gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
      delay: 0.1,
    },
    {
      icon: HiCheckCircle,
      label: 'Submitted',
      value: submissions.length,
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      delay: 0.2,
    },
    {
      icon: HiClock,
      label: 'Pending',
      value: pendingAssignments.length,
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',
      delay: 0.3,
    },
    {
      icon: HiExclamation,
      label: 'Overdue',
      value: overdueCount,
      gradient: 'bg-gradient-to-br from-rose-500 to-pink-600',
      delay: 0.4,
    },
  ];

  /* greeting based on time */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        <div className="h-36 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <ShimmerCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white">
              {greeting}, {user?.name?.split(' ')[0]}!
            </h1>
            <span className="text-2xl">{greetEmoji}</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Quick action */}
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link
            to="/student/assignments"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl
              bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold
              shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow"
          >
            <HiLightningBolt /> View Assignments
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Eco Banner ── */}
      <EcoBanner totalSubmissions={submissions.length} />

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Subjects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <HiBookOpen className="text-emerald-500" /> Your Subjects
            </h2>
            <Link
              to="/student/assignments"
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              View all <HiArrowRight />
            </Link>
          </div>

          {subjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-card"
            >
              <div className="text-5xl mb-3">📚</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                You haven&apos;t been enrolled in any subjects yet.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjects.map((subject, i) => (
                <SubjectCard
                  key={subject._id}
                  subject={subject}
                  role="student"
                  index={i}
                  assignmentCount={assignCounts[subject._id] || 0}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* To-Do Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5 h-fit"
        >
          {/* Panel header */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <HiLightningBolt className="text-amber-500 text-sm" />
            </div>
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">To Do</h2>
            {pendingAssignments.length > 0 && (
              <span className="ml-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white
                text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm shadow-amber-200">
                {pendingAssignments.length}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {pendingAssignments.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="text-5xl mb-3">✅</div>
                <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No pending assignments 🎉</p>
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {pendingAssignments.slice(0, 8).map((a, i) => (
                  <TodoItem
                    key={a._id}
                    assignment={a}
                    subjectName={a.subject?.name || 'Unknown'}
                    index={i}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {pendingAssignments.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800"
            >
              <Link
                to="/student/submissions"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                  bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20
                  text-emerald-700 dark:text-emerald-400 text-sm font-semibold
                  hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30
                  transition-all group"
              >
                View all submissions
                <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Recent Activity Bar ── */}
      {submissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <HiTrendingUp className="text-violet-500" /> Recent Submissions
            </h2>
            <Link to="/student/submissions" className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline flex items-center gap-1">
              See all <HiArrowRight />
            </Link>
          </div>
          <div className="space-y-2">
            {submissions.slice(0, 4).map((sub, i) => {
              const isGraded = sub.status === 'graded';
              const isLate = sub.status === 'late';
              return (
                <motion.div
                  key={sub._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.07 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0
                    ${isGraded ? 'bg-emerald-500' : isLate ? 'bg-red-400' : 'bg-amber-400'}`}
                  />
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">
                    {sub.assignment?.title || 'Assignment'}
                  </p>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {sub.submittedAt ? format(new Date(sub.submittedAt), 'MMM d') : '—'}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                    ${isGraded
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : isLate
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    }`}>
                    {sub.status}
                    {isGraded && sub.marks != null ? ` · ${sub.marks}` : ''}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
