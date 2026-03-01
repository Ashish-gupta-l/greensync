import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { GiTreeBranch } from 'react-icons/gi';
import { HiDocumentText, HiUsers, HiCheckCircle, HiClock } from 'react-icons/hi';
import { analyticsAPI } from '../../services/api';
import Spinner from '../../components/ui/Spinner';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#16a34a', '#0284c7', '#7c3aed', '#db2777', '#d97706', '#059669', '#dc2626', '#6366f1'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getEco()
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!data) return <div className="text-center py-20 text-gray-500">Failed to load analytics.</div>;

  const { stats, eco, monthlyData, subjectData } = data;

  // Format monthly data for chart
  const monthlyChartData = (monthlyData || []).map(m => ({
    name: `${MONTHS[m._id.month - 1]} ${m._id.year}`,
    submissions: m.count,
  }));

  // Format subject data for pie chart
  const subjectChartData = (subjectData || []).map(s => ({
    name: s.name,
    value: s.count,
  }));

  const ecoCards = [
    { icon: '🌳', label: 'Trees Saved', value: eco?.treesSaved ?? 0, color: 'from-emerald-500 to-green-700' },
    { icon: '📄', label: 'Pages Saved', value: (eco?.pagesSaved ?? 0).toLocaleString(), color: 'from-blue-500 to-indigo-700' },
    { icon: '💨', label: 'CO₂ Reduced', value: `${eco?.co2SavedKg ?? 0} kg`, color: 'from-teal-500 to-cyan-700' },
    { icon: '💧', label: 'Water Saved', value: `${(eco?.waterLitres ?? 0).toLocaleString()} L`, color: 'from-violet-500 to-purple-700' },
  ];

  const statCards = [
    { icon: HiDocumentText, label: 'Total Submissions', value: stats?.totalSubmissions ?? 0, color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
    { icon: HiCheckCircle, label: 'Graded', value: stats?.gradedSubmissions ?? 0, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
    { icon: HiClock, label: 'Pending', value: stats?.pendingSubmissions ?? 0, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
    { icon: HiUsers, label: 'Total Users', value: (stats?.totalStudents ?? 0) + (stats?.totalTeachers ?? 0), color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Analytics & Eco Impact</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform-wide metrics and environmental impact</p>
      </div>

      {/* Eco Impact Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ecoCards.map(({ icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-5 text-white`}
          >
            <div className="absolute top-2 right-2 text-4xl opacity-20">{icon}</div>
            <div className="relative">
              <div className="font-display font-bold text-3xl">{value}</div>
              <div className="text-white/80 text-xs mt-1">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions over time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5"
        >
          <h2 className="font-display font-semibold text-base text-gray-900 dark:text-white mb-4">Submissions Over Time</h2>
          {monthlyChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="submissions"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ fill: '#16a34a', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Per-subject breakdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5"
        >
          <h2 className="font-display font-semibold text-base text-gray-900 dark:text-white mb-4">Submissions by Subject</h2>
          {subjectChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={subjectChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" name="Submissions" radius={[0, 8, 8, 0]}>
                  {subjectChartData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Eco impact message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-2xl p-5 flex items-center gap-4"
      >
        <GiTreeBranch className="text-4xl text-primary-600 flex-shrink-0" />
        <div>
          <p className="font-display font-semibold text-primary-800 dark:text-primary-300">
            {eco?.message || 'Keep going! Every submission helps save the planet.'}
          </p>
          <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
            Formula: Pages Saved = Submissions × 5 · Trees Saved = Pages / 8000 · CO₂ = Pages × 4.8g
          </p>
        </div>
      </motion.div>
    </div>
  );
}
