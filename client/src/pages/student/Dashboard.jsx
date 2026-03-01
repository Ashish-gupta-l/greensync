import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';
import {
  HiLightningBolt, HiClipboardList, HiCheckCircle,
  HiClock, HiExclamation, HiArrowRight
} from 'react-icons/hi';
import { GiTreeBranch } from 'react-icons/gi';
import SubjectCard from '../../components/common/SubjectCard';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { assignmentAPI, submissionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EcoBanner = ({ totalSubmissions = 0 }) => {
  const pages     = totalSubmissions * 5;
  const trees     = (pages / 8000).toFixed(2);
  const co2       = (totalSubmissions * 0.02).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-6 text-white mb-6"
    >
      {/* Decorative bg */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")", backgroundSize: '30px 30px' }}
      />
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <GiTreeBranch className="text-3xl text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl">Your Eco Impact 🌍</h2>
            <p className="text-white/80 text-sm">Every digital submission saves paper</p>
          </div>
        </div>
        <div className="flex gap-6">
          {[
            { label: 'Trees Saved', value: trees },
            { label: 'Pages Saved', value: pages.toLocaleString() },
            { label: 'CO₂ Reduced', value: `${co2} kg` },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="font-display font-bold text-2xl">{value}</div>
              <div className="text-white/70 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const TodoItem = ({ assignment, subjectName }) => {
  const deadline = new Date(assignment.deadline);
  const overdue  = isPast(deadline);
  const urgent   = !overdue && isWithinInterval(new Date(), { start: new Date(), end: addDays(deadline, 0) }) &&
                   deadline - new Date() < 24 * 60 * 60 * 1000;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 ${overdue ? 'border-red-400' : urgent ? 'border-amber-400' : 'border-gray-300 dark:border-gray-600'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{assignment.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{subjectName}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <span className={`text-xs font-medium ${overdue ? 'text-red-500' : urgent ? 'text-amber-500' : 'text-gray-400'}`}>
          {overdue ? 'Overdue' : format(deadline, 'MMM d')}
        </span>
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const { subjects = [] } = useOutletContext() || {};

  const [assignments,   setAssignments]   = useState([]);
  const [submissions,   setSubmissions]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [assignCounts,  setAssignCounts]  = useState({});

  useEffect(() => {
    Promise.all([assignmentAPI.getAll(), submissionAPI.getMy()])
      .then(([aRes, sRes]) => {
        const allAssign = aRes.data.assignments || [];
        setAssignments(allAssign);
        setSubmissions(sRes.data.submissions || []);

        // Build counts per subject
        const counts = {};
        allAssign.forEach(a => {
          const sid = a.subject?._id || a.subject;
          counts[sid] = (counts[sid] || 0) + 1;
        });
        setAssignCounts(counts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const submittedIds = new Set(submissions.map(s => s.assignment?._id || s.assignment));

  const pendingAssignments = assignments.filter(a => {
    const sid = a.subject?._id || a.subject;
    return !submittedIds.has(a._id);
  });

  const stats = [
    { icon: HiClipboardList,  label: 'Enrolled Subjects', value: subjects.length,        color: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' },
    { icon: HiCheckCircle,    label: 'Submitted',          value: submissions.length,     color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
    { icon: HiClock,          label: 'Pending',            value: pendingAssignments.length, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
    { icon: HiExclamation,    label: 'Overdue',            value: pendingAssignments.filter(a => isPast(new Date(a.deadline))).length, color: 'bg-red-50 dark:bg-red-900/20 text-red-600' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Eco Banner */}
      <EcoBanner totalSubmissions={submissions.length} />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-card"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="text-xl" />
            </div>
            <div className="font-display font-bold text-2xl text-gray-900 dark:text-white">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Subjects grid (GC-style) */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white">Your Subjects</h2>
          </div>
          {subjects.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-card">
              <div className="text-5xl mb-3">📚</div>
              <p className="text-gray-500 dark:text-gray-400">You haven't been enrolled in any subjects yet.</p>
            </div>
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
        </div>

        {/* To-do panel */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <HiLightningBolt className="text-amber-500 text-xl" />
            <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white">To Do</h2>
            {pendingAssignments.length > 0 && (
              <span className="ml-auto bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                {pendingAssignments.length}
              </span>
            )}
          </div>

          {pendingAssignments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-0">
              {pendingAssignments.slice(0, 8).map(a => (
                <TodoItem
                  key={a._id}
                  assignment={a}
                  subjectName={a.subject?.name || 'Unknown'}
                />
              ))}
            </div>
          )}

          {pendingAssignments.length > 0 && (
            <Link
              to="/student/submissions"
              className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline mt-4 font-medium"
            >
              View all submissions <HiArrowRight />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
