import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  HiArrowLeft, HiPlus, HiDocumentText,
  HiUsers, HiTrash, HiClock
} from 'react-icons/hi';
import { subjectAPI, assignmentAPI, submissionAPI } from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const GRADIENTS = [
  'from-emerald-500 to-green-700',
  'from-teal-500 to-cyan-700',
  'from-blue-500 to-indigo-700',
  'from-violet-500 to-purple-700',
  'from-pink-500 to-rose-700',
  'from-amber-500 to-orange-700',
];

export default function TeacherSubjectView() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [subject,     setSubject]     = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      subjectAPI.getOne(subjectId),
      assignmentAPI.getAll({ subject: subjectId }),
      submissionAPI.getAll({ subject: subjectId }),
    ])
      .then(([sRes, aRes, subRes]) => {
        setSubject(sRes.data.subject);
        setAssignments(aRes.data.assignments || []);
        setSubmissions(subRes.data.submissions || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subjectId]);

  const deleteAssignment = async (id) => {
    if (!window.confirm('Delete this assignment? This cannot be undone.')) return;
    try {
      const { assignmentAPI: aAPI } = await import('../../services/api');
      await aAPI.remove(id);
      setAssignments(prev => prev.filter(a => a._id !== id));
      toast.success('Assignment deleted.');
    } catch {
      toast.error('Failed to delete assignment.');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!subject) return <div className="text-center py-20 text-gray-500">Subject not found.</div>;

  const gradient = GRADIENTS[(subject.colorIndex || 0) % GRADIENTS.length];

  const getSubCount = (assignId) =>
    submissions.filter(s => (s.assignment?._id || s.assignment) === assignId).length;
  const getPendingCount = (assignId) =>
    submissions.filter(s => (s.assignment?._id || s.assignment) === assignId && (s.status === 'submitted' || s.status === 'late')).length;

  return (
    <div className="space-y-6">
      <Link to="/teacher" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <HiArrowLeft /> Back to Dashboard
      </Link>

      {/* Subject banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-8 text-white`}
      >
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")", backgroundSize: '40px 40px' }}
        />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="text-white/70 text-sm font-mono mb-1">{subject.code}</div>
            <h1 className="font-display font-bold text-3xl mb-1">{subject.name}</h1>
            <div className="flex items-center gap-3 text-white/70 text-sm">
              <span className="flex items-center gap-1"><HiUsers /> {subject.students?.length || 0} students</span>
              <span className="flex items-center gap-1"><HiDocumentText /> {assignments.length} assignments</span>
            </div>
          </div>
          <Link
            to={`/teacher/assignments/create?subject=${subjectId}`}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold transition-colors"
          >
            <HiPlus /> New Assignment
          </Link>
        </div>
      </motion.div>

      {/* Assignments list */}
      <div>
        <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">
          Assignments ({assignments.length})
        </h2>

        {assignments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-card">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">No assignments yet.</p>
            <Link
              to={`/teacher/assignments/create?subject=${subjectId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              <HiPlus /> Create First Assignment
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a, i) => {
              const subCount  = getSubCount(a._id);
              const pending   = getPendingCount(a._id);
              const total     = subject.students?.length || 0;

              return (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${gradient}`}>
                    <HiDocumentText className="text-white text-xl" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{a.title}</h3>
                    {a.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{a.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><HiClock /> Due: {format(new Date(a.deadline), 'MMM d, yyyy')}</span>
                      <span>Max: {a.maxMarks} marks</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">{subCount}/{total} submitted</span>
                        {pending > 0 && (
                          <span className="text-amber-600 font-medium">{pending} to grade</span>
                        )}
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all"
                          style={{ width: total > 0 ? `${(subCount / total) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      to={`/teacher/assignments/${a._id}/submissions`}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-colors"
                    >
                      Submissions ({subCount})
                    </Link>
                    <button
                      onClick={() => deleteAssignment(a._id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <HiTrash />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
