import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { HiDocumentText, HiExternalLink, HiFilter } from 'react-icons/hi';
import { submissionAPI } from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

const STATUS_OPTIONS = ['all', 'submitted', 'graded', 'returned', 'late', 'pending'];

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState('all');

  useEffect(() => {
    submissionAPI.getMy()
      .then(({ data }) => setSubmissions(data.submissions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? submissions
    : submissions.filter(s => s.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">My Submissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{submissions.length} total submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <HiFilter className="text-gray-400" />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl shadow-card">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-500 dark:text-gray-400">No submissions found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {['Assignment', 'Subject', 'Status', 'Submitted', 'Marks', 'File'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <HiDocumentText className="text-primary-600 text-sm" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[160px]">
                          {s.assignment?.title || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {s.assignment?.subject?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={s.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {format(new Date(s.submittedAt || s.createdAt), 'MMM d, h:mm a')}
                    </td>
                    <td className="px-4 py-3">
                      {s.marks != null ? (
                        <span className="font-semibold text-primary-600">
                          {s.marks} / {s.assignment?.maxMarks}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {s.fileUrl ? (
                        <a
                          href={s.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 hover:underline text-xs"
                        >
                          View <HiExternalLink />
                        </a>
                      ) : '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((s, i) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{s.assignment?.title || '—'}</p>
                  <Badge status={s.status} />
                </div>
                <p className="text-xs text-gray-500">{s.assignment?.subject?.name}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{format(new Date(s.submittedAt || s.createdAt), 'MMM d, h:mm a')}</span>
                  {s.marks != null && <span className="text-primary-600 font-semibold">Marks: {s.marks}/{s.assignment?.maxMarks}</span>}
                  {s.fileUrl && (
                    <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-primary-600 flex items-center gap-0.5">
                      View <HiExternalLink />
                    </a>
                  )}
                </div>
                {s.feedback && (
                  <p className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    💬 {s.feedback}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
