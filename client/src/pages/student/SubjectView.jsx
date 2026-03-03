import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, isPast } from 'date-fns';
import { HiDocumentText, HiClock, HiArrowLeft, HiUpload } from 'react-icons/hi';
import { subjectAPI, assignmentAPI, submissionAPI } from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import CountdownTimer from '../../components/common/CountdownTimer';

const GRADIENTS = [
  'from-emerald-500 to-green-700',
  'from-teal-500 to-cyan-700',
  'from-blue-500 to-indigo-700',
  'from-violet-500 to-purple-700',
  'from-pink-500 to-rose-700',
  'from-amber-500 to-orange-700',
];

export default function StudentSubjectView() {
  const { subjectId } = useParams();

  const [subject,     setSubject]     = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      subjectAPI.getOne(subjectId),
      assignmentAPI.getAll({ subject: subjectId }),
      submissionAPI.getMy(),
    ])
      .then(([sRes, aRes, subRes]) => {
        setSubject(sRes.data.subject);
        setAssignments(aRes.data.assignments || []);
        setSubmissions(subRes.data.submissions || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!subject)  return <div className="text-center py-20 text-gray-500">Subject not found.</div>;

  const gradient = GRADIENTS[(subject.colorIndex || 0) % GRADIENTS.length];

  const submissionMap = {};
  submissions.forEach(s => {
    const aid = s.assignment?._id || s.assignment;
    submissionMap[aid] = s;
  });

  const getStatus = (a) => {
    const sub = submissionMap[a._id];
    if (!sub) return isPast(new Date(a.deadline)) ? 'late' : 'pending';
    return sub.status || 'submitted';
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/student" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
        <HiArrowLeft /> Back to Dashboard
      </Link>

      {/* Subject header banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-8 text-white`}
      >
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")", backgroundSize: '40px 40px' }}
        />
        <div className="relative">
          <div className="text-white/70 text-sm font-mono mb-1">{subject.code}</div>
          <h1 className="font-display font-bold text-3xl mb-2">{subject.name}</h1>
          <p className="text-white/80 text-sm">{subject.teacher?.name || 'No teacher assigned'}</p>
          {subject.description && (
            <p className="text-white/70 text-sm mt-3 max-w-2xl">{subject.description}</p>
          )}
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
            <p className="text-gray-500 dark:text-gray-400">No assignments yet for this subject.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a, i) => {
              const status = getStatus(a);
              const sub    = submissionMap[a._id];
              const past   = isPast(new Date(a.deadline));

              return (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${gradient}`}>
                    <HiDocumentText className="text-white text-xl" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{a.title}</h3>
                      <Badge status={status} />
                    </div>
                    {a.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{a.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <HiClock /> Due: {format(new Date(a.deadline), 'MMM d, yyyy h:mm a')}
                      </span>
                      <span>Max Marks: {a.maxMarks}</span>
                    </div>
                    {/* Countdown */}
                    {!past && status === 'pending' && (
                      <div className="mt-2">
                        <CountdownTimer deadline={a.deadline} />
                      </div>
                    )}
                    {/* Submitted info */}
                    {sub && (
                      <div className="mt-2 text-xs text-gray-500">
                        Submitted: {format(new Date(sub.submittedAt || sub.createdAt), 'MMM d, h:mm a')}
                        {sub.marks != null && <span className="ml-2 text-primary-600 font-semibold">Marks: {sub.marks}/{a.maxMarks}</span>}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      to={`/student/subjects/${subjectId}/assignments/${a._id}`}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Details
                    </Link>
                    {(status === 'pending' || status === 'late' || status === 'submitted') && (
                      <Link
                        to={`/student/assignments/${a._id}/submit`}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 text-white transition-colors
                          ${status === 'late' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-600 hover:bg-primary-700'}`}
                      >
                        <HiUpload /> {sub ? 'Resubmit' : 'Submit'}
                      </Link>
                    )}
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
