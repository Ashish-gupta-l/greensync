import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  HiArrowLeft, HiDownload, HiDocumentText, HiExternalLink,
  HiSortAscending, HiSortDescending, HiFilter
} from 'react-icons/hi';
import { assignmentAPI, submissionAPI } from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import PlagiarismBadge from '../../components/common/PlagiarismBadge';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['all', 'submitted', 'late', 'graded', 'returned'];

export default function SubmissionsList() {
  const { assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    Promise.all([
      assignmentAPI.getOne(assignmentId),
      submissionAPI.getAll({ assignmentId }),
    ])
      .then(([aRes, sRes]) => {
        setAssignment(aRes.data.assignment);
        setSubmissions(sRes.data.submissions || []);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [assignmentId]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const filtered = (filter === 'all' ? submissions : submissions.filter(s => s.status === filter))
    .sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'submittedAt') {
        aVal = new Date(a.submittedAt || a.createdAt);
        bVal = new Date(b.submittedAt || b.createdAt);
      } else if (sortBy === 'name') {
        aVal = a.student?.name?.toLowerCase() || '';
        bVal = b.student?.name?.toLowerCase() || '';
      } else if (sortBy === 'marks') {
        aVal = a.marks ?? -1;
        bVal = b.marks ?? -1;
      } else if (sortBy === 'plagiarism') {
        aVal = a.plagiarismScore ?? -1;
        bVal = b.plagiarismScore ?? -1;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const handleBulkDownload = async () => {
    setDownloading(true);
    try {
      const { data } = await submissionAPI.bulkDownload(assignmentId);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `submissions_${assignmentId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download.');
    } finally {
      setDownloading(false);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortDir === 'asc' ? <HiSortAscending className="inline text-xs" /> : <HiSortDescending className="inline text-xs" />;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!assignment) return <div className="text-center py-20 text-gray-500">Assignment not found.</div>;

  return (
    <div className="space-y-6">
      <Link to={`/teacher/subjects/${assignment.subject?._id || assignment.subject}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <HiArrowLeft /> Back to Subject
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-6"
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{assignment.subject?.name}</p>
            <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white">{assignment.title}</h1>
            <p className="text-xs text-gray-400 mt-1">
              Deadline: {format(new Date(assignment.deadline), 'MMM d, yyyy h:mm a')} · Max: {assignment.maxMarks} marks
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBulkDownload}
              disabled={downloading || submissions.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {downloading ? <Spinner size="sm" color="white" /> : <HiDownload />}
              {downloading ? 'Zipping...' : 'Download All'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm">
          <span className="text-gray-500">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</span>
          <span className="text-amber-600 font-medium">
            {submissions.filter(s => s.status === 'submitted' || s.status === 'late').length} to grade
          </span>
        </div>
      </motion.div>

      {/* Filter */}
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

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl shadow-card">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-500 dark:text-gray-400">No submissions found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden">
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {[
                    { label: 'Student', field: 'name' },
                    { label: 'Status', field: null },
                    { label: 'Submitted', field: 'submittedAt' },
                    { label: 'Marks', field: 'marks' },
                    { label: 'Plagiarism', field: 'plagiarism' },
                    { label: 'File', field: null },
                    { label: 'Action', field: null },
                  ].map(({ label, field }) => (
                    <th
                      key={label}
                      onClick={() => field && toggleSort(field)}
                      className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide ${field ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none' : ''}`}
                    >
                      {label} {field && <SortIcon field={field} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-700">
                          {s.student?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-xs">{s.student?.name}</p>
                          <p className="text-xs text-gray-400">{s.student?.rollNumber || s.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge status={s.status} /></td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {format(new Date(s.submittedAt || s.createdAt), 'MMM d, h:mm a')}
                      {s.version > 1 && <span className="text-gray-400 ml-1">(v{s.version})</span>}
                    </td>
                    <td className="px-4 py-3">
                      {s.marks != null ? (
                        <span className="font-semibold text-primary-600">{s.marks}/{assignment.maxMarks}</span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <PlagiarismBadge score={s.plagiarismScore} />
                    </td>
                    <td className="px-4 py-3">
                      {s.fileUrl ? (
                        <div className="flex flex-col gap-1">
                          <a
                            href={`https://docs.google.com/viewer?url=${encodeURIComponent(s.fileUrl)}&embedded=false`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary-600 hover:underline text-xs"
                          >
                            <HiExternalLink /> View PDF
                          </a>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/teacher/submissions/${s._id}/grade`}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                      >
                        Grade
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((s, i) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-700">
                      {s.student?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{s.student?.name}</p>
                      <p className="text-xs text-gray-400">{s.student?.rollNumber}</p>
                    </div>
                  </div>
                  <Badge status={s.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                  <span>{format(new Date(s.submittedAt || s.createdAt), 'MMM d, h:mm a')}</span>
                  {s.marks != null && <span className="text-primary-600 font-semibold">{s.marks}/{assignment.maxMarks}</span>}
                  <PlagiarismBadge score={s.plagiarismScore} />
                </div>
                <div className="flex gap-2">
                  {s.fileUrl && (
                    <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 flex items-center gap-0.5">
                      View PDF <HiExternalLink />
                    </a>
                  )}
                  <Link
                    to={`/teacher/submissions/${s._id}/grade`}
                    className="text-xs text-primary-700 font-semibold"
                  >
                    Grade →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
