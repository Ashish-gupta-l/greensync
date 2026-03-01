import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { HiDocumentText, HiEye, HiFilter } from 'react-icons/hi';
import api, { submissionAPI } from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import PdfPreviewModal from '../../components/common/PdfPreviewModal';

const STATUS_OPTIONS = ['all', 'submitted', 'graded', 'returned', 'late', 'pending'];

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // PDF modal state
  const [pdfModal, setPdfModal] = useState({ open: false, proxyUrl: '', directUrl: '', title: '' });
  const openPdf = (directUrl, title, id) => {
    const token = localStorage.getItem('gs_token');
    const proxyUrl = `${api.defaults.baseURL}/submissions/${id}/file?token=${token}`;
    setPdfModal({ open: true, proxyUrl, directUrl, title });
  };
  const closePdf = () => setPdfModal(m => ({ ...m, open: false }));

  useEffect(() => {
    submissionAPI.getMy()
      .then(({ data }) => setSubmissions(data.submissions || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? submissions
    : submissions.filter(s => s.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      {/* PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={pdfModal.open}
        onClose={closePdf}
        proxyUrl={pdfModal.proxyUrl}
        directUrl={pdfModal.directUrl}
        title={pdfModal.title}
      />

      {/* Header */}
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
          {/* ── Desktop table ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {['Assignment', 'Subject', 'Status', 'Submitted', 'Marks', 'PDF Preview'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
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
                    {/* Assignment */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                          <HiDocumentText className="text-primary-600 text-sm" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[160px]">
                          {s.assignment?.title || '—'}
                        </span>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {s.assignment?.subject?.name || '—'}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3"><Badge status={s.status} /></td>

                    {/* Submitted At */}
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {format(new Date(s.submittedAt || s.createdAt), 'MMM d, h:mm a')}
                    </td>

                    {/* Marks */}
                    <td className="px-4 py-3">
                      {s.marks != null ? (
                        <span className="font-semibold text-primary-600">
                          {s.marks} / {s.assignment?.maxMarks}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>

                    {/* PDF Preview */}
                    <td className="px-4 py-3">
                      {s.fileUrl ? (
                        <button
                          onClick={() => openPdf(s.fileUrl, s.assignment?.title, s._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-100/30 transition-colors"
                        >
                          <HiEye className="text-sm" />
                          View PDF
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">No file</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ── */}
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
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{s.assignment?.title || '—'}</p>
                    <p className="text-xs text-gray-500">{s.assignment?.subject?.name}</p>
                  </div>
                  <Badge status={s.status} />
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                  <span>{format(new Date(s.submittedAt || s.createdAt), 'MMM d, h:mm a')}</span>
                  {s.marks != null && (
                    <span className="text-primary-600 font-semibold">
                      Marks: {s.marks}/{s.assignment?.maxMarks}
                    </span>
                  )}
                </div>

                {/* Feedback */}
                {s.feedback && (
                  <p className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    💬 {s.feedback}
                  </p>
                )}

                {/* PDF Button */}
                {s.fileUrl && (
                  <button
                    onClick={() => openPdf(s.fileUrl, s.assignment?.title, s._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    <HiEye className="text-sm" />
                    View PDF
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
