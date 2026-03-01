import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, isPast } from 'date-fns';
import {
  HiArrowLeft, HiUpload, HiDocumentText, HiClock,
  HiStar, HiAnnotation, HiExternalLink, HiRefresh
} from 'react-icons/hi';
import { assignmentAPI, submissionAPI } from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import CountdownTimer from '../../components/common/CountdownTimer';

export default function AssignmentView() {
  const { subjectId, assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      assignmentAPI.getOne(assignmentId),
      submissionAPI.getMy(),
    ])
      .then(([aRes, sRes]) => {
        setAssignment(aRes.data.assignment);
        const mySubmission = (sRes.data.submissions || []).find(
          s => (s.assignment?._id || s.assignment) === assignmentId
        );
        setSubmission(mySubmission || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [assignmentId]);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!assignment) return <div className="text-center py-20 text-gray-500">Assignment not found.</div>;

  const deadline = new Date(assignment.deadline);
  const past     = isPast(deadline);
  const status   = submission
    ? (submission.status || 'submitted')
    : past ? 'late' : 'pending';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back */}
      <Link
        to={`/student/subjects/${subjectId}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <HiArrowLeft /> Back to Subject
      </Link>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-6"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-700 rounded-xl flex items-center justify-center">
                <HiDocumentText className="text-white text-lg" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{assignment.subject?.name}</p>
                <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white">{assignment.title}</h1>
              </div>
            </div>
            <Badge status={status} />
          </div>
        </div>

        {assignment.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-4 leading-relaxed">{assignment.description}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs mb-1">
              <HiClock /> Deadline
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              {format(deadline, 'MMM d, yyyy')}
            </p>
            <p className="text-xs text-gray-500">{format(deadline, 'h:mm a')}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs mb-1">
              <HiStar /> Max Marks
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{assignment.maxMarks}</p>
          </div>
          {!past && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Time Left</div>
              <CountdownTimer deadline={assignment.deadline} compact />
            </div>
          )}
        </div>
      </motion.div>

      {/* Submission status */}
      {submission ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-6"
        >
          <h2 className="font-display font-semibold text-base text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <HiDocumentText className="text-primary-600" /> Your Submission
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">File</span>
              <a
                href={submission.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-primary-600 hover:underline font-medium"
              >
                {submission.renamedFileName || submission.originalFileName} <HiExternalLink />
              </a>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Submitted at</span>
              <span className="text-gray-800 dark:text-gray-200">
                {format(new Date(submission.submittedAt || submission.createdAt), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Version</span>
              <span className="text-gray-800 dark:text-gray-200">v{submission.version || 1}</span>
            </div>
            {submission.marks != null && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 flex items-center gap-1"><HiStar /> Marks</span>
                <span className="font-bold text-primary-600">{submission.marks} / {assignment.maxMarks}</span>
              </div>
            )}
            {submission.feedback && (
              <div className="py-2">
                <div className="flex items-center gap-1 text-gray-500 mb-1.5"><HiAnnotation /> Feedback</div>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm">
                  {submission.feedback}
                </p>
              </div>
            )}
          </div>

          {/* Resubmit */}
          <Link
            to={`/student/assignments/${assignmentId}/submit`}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-colors"
          >
            <HiRefresh /> Resubmit
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-8 text-center"
        >
          <div className="text-5xl mb-3">📤</div>
          <h3 className="font-display font-semibold text-gray-700 dark:text-gray-300 mb-2">No submission yet</h3>
          <p className="text-sm text-gray-500 mb-5">
            {past ? 'The deadline has passed. You can still submit but it will be marked as late.' : `Submit your work before ${format(deadline, 'MMM d')}.`}
          </p>
          <Link
            to={`/student/assignments/${assignmentId}/submit`}
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm transition-colors"
          >
            <HiUpload /> Submit Now
          </Link>
        </motion.div>
      )}
    </div>
  );
}
