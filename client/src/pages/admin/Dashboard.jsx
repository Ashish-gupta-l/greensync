import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiUsers, HiAcademicCap, HiBookOpen, HiDocumentText,
  HiChartBar, HiCheckCircle, HiClock, HiArrowRight
} from 'react-icons/hi';
import { GiTreeBranch } from 'react-icons/gi';
import { analyticsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getEco()
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  const s = data?.stats || {};
  const eco = data?.eco || {};

  const statCards = [
    { icon: HiUsers, label: 'Students', value: s.totalStudents || 0, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600', to: '/admin/students' },
    { icon: HiAcademicCap, label: 'Teachers', value: s.totalTeachers || 0, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600', to: '/admin/teachers' },
    { icon: HiBookOpen, label: 'Subjects', value: s.totalSubjects || 0, color: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600', to: '/admin/subjects' },
    { icon: HiDocumentText, label: 'Assignments', value: s.totalAssignments || 0, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
    { icon: HiCheckCircle, label: 'Submissions', value: s.totalSubmissions || 0, color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
    { icon: HiClock, label: 'Pending Grading', value: s.pendingSubmissions || 0, color: 'bg-red-50 dark:bg-red-900/20 text-red-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Welcome back, {user?.name?.split(' ')[0]}. Here's an overview of the platform.
        </p>
      </div>

      {/* Eco Impact Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-6 text-white"
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")", backgroundSize: '30px 30px' }}
        />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <GiTreeBranch className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Platform Eco Impact 🌍</h2>
              <p className="text-white/80 text-sm">{eco.message || 'Every submission saves paper!'}</p>
            </div>
          </div>
          <div className="flex gap-6">
            {[
              { label: 'Trees Saved', value: eco.treesSaved ?? 0 },
              { label: 'Pages Saved', value: (eco.pagesSaved ?? 0).toLocaleString() },
              { label: 'CO₂ Reduced', value: `${eco.co2SavedKg ?? 0} kg` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="font-display font-bold text-2xl">{value}</div>
                <div className="text-white/70 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ icon: Icon, label, value, color, to }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            {to ? (
              <Link to={to} className="block bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                  <Icon className="text-xl" />
                </div>
                <div className="font-display font-bold text-2xl text-gray-900 dark:text-white">{value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
              </Link>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-card">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                  <Icon className="text-xl" />
                </div>
                <div className="font-display font-bold text-2xl text-gray-900 dark:text-white">{value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Manage Students', icon: HiUsers, to: '/admin/students', desc: 'Add, edit, or remove student accounts' },
          { label: 'Manage Teachers', icon: HiAcademicCap, to: '/admin/teachers', desc: 'Manage teacher profiles' },
          { label: 'Manage Subjects', icon: HiBookOpen, to: '/admin/subjects', desc: 'Create subjects and assign teachers' },
          { label: 'View Analytics', icon: HiChartBar, to: '/admin/analytics', desc: 'Eco-impact charts and submission trends' },
        ].map(({ label, icon: Icon, to, desc }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <Link
              to={to}
              className="block bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className="text-xl text-primary-600" />
                <span className="font-display font-semibold text-gray-900 dark:text-white text-sm">{label}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
              <span className="flex items-center gap-1 text-xs text-primary-600 mt-3 font-medium group-hover:underline">
                Go <HiArrowRight />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
