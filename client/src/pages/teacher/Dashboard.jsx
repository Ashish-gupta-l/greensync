import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiClipboardList, HiDocumentText, HiCheckCircle,
  HiClock, HiPlus
} from 'react-icons/hi';
import { assignmentAPI, submissionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SubjectCard from '../../components/common/SubjectCard';
import Spinner from '../../components/ui/Spinner';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { subjects = [] } = useOutletContext() || {};

  const [assignments,   setAssignments]   = useState([]);
  const [submissions,   setSubmissions]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [assignCounts,  setAssignCounts]  = useState({});

  useEffect(() => {
    Promise.all([assignmentAPI.getAll(), submissionAPI.getAll()])
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pendingGrade = submissions.filter(s => s.status === 'submitted' || s.status === 'late').length;

  const stats = [
    { icon: HiClipboardList, label: 'My Subjects',     value: subjects.length,     color: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' },
    { icon: HiDocumentText,  label: 'Assignments',     value: assignments.length,  color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
    { icon: HiDocumentText,  label: 'Submissions',     value: submissions.length,  color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
    { icon: HiClock,         label: 'Pending Grading', value: pendingGrade,        color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">
            Welcome, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link
          to="/teacher/assignments/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors shadow-glow"
        >
          <HiPlus /> New Assignment
        </Link>
      </div>

      {/* Stats */}
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

      {/* Subjects grid */}
      <div>
        <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">My Classes</h2>
        {subjects.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-card">
            <div className="text-5xl mb-3">🏫</div>
            <p className="text-gray-500 dark:text-gray-400">No subjects assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject, i) => (
              <SubjectCard
                key={subject._id}
                subject={subject}
                role="teacher"
                index={i}
                assignmentCount={assignCounts[subject._id] || 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pending grading alert */}
      {pendingGrade > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3"
        >
          <HiCheckCircle className="text-amber-600 text-2xl flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {pendingGrade} submission{pendingGrade > 1 ? 's' : ''} pending grading
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              Click a subject to view and grade submissions.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
