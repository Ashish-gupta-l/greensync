import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  HiArrowLeft, HiStar, HiAnnotation, HiExternalLink,
  HiCheckCircle, HiDocumentText, HiClock
} from 'react-icons/hi';
import { submissionAPI } from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import PlagiarismBadge from '../../components/common/PlagiarismBadge';
import toast from 'react-hot-toast';

export default function GradeSubmission() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('graded');

  useEffect(() => {
    submissionAPI.getOne(submissionId)
      .then(({ data }) => {
        const s = data.submission;
        setSubmission(s);
        if (s.marks != null) setMarks(String(s.marks));
        if (s.feedback) setFeedback(s.feedback);
        if (s.status === 'graded' || s.status === 'returned') setStatus(s.status);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [submissionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const maxMarks = submission?.assignment?.maxMarks || 100;

    if (marks === '' || isNaN(marks)) {
      toast.error('Please enter valid marks.');
      return;
    }
    if (Number(marks) < 0 || Number(marks) > maxMarks) {
      toast.error(`Marks must be between 0 and ${maxMarks}.`);
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await submissionAPI.grade(submissionId, {
        marks: Number(marks),
        feedback,
        status,
      });
      setSubmission(data.submission);
      toast.success('Submission graded! 🎯');
      navigate(-1);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to grade.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!submission) return <div className="text-center py-20 text-gray-500">Submission not found.</div>;

  const assignment = submission.assignment;
  const student = submission.student;
  const maxMarks = assignment?.maxMarks || 100;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        to={`/teacher/assignments/${assignment?._id}/submissions`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <HiArrowLeft /> Back to Submissions
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: PDF viewer / info */}
        <div className="lg:col-span-3 space-y-4">
          {/* Student + assignment info */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5"
          >
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-base font-bold text-primary-700">
                  {student?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{student?.name}</p>
                  <p className="text-xs text-gray-400">{student?.rollNumber || student?.email}</p>
                </div>
              </div>
              <Badge status={submission.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5">
                <span className="text-gray-400 flex items-center gap-1"><HiDocumentText /> Assignment</span>
                <p className="font-semibold text-gray-800 dark:text-white mt-0.5 truncate">{assignment?.title}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5">
                <span className="text-gray-400 flex items-center gap-1"><HiClock /> Submitted</span>
                <p className="font-semibold text-gray-800 dark:text-white mt-0.5">
                  {format(new Date(submission.submittedAt || submission.createdAt), 'MMM d, h:mm a')}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5">
                <span className="text-gray-400">Version</span>
                <p className="font-semibold text-gray-800 dark:text-white mt-0.5">v{submission.version || 1}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5">
                <span className="text-gray-400">Plagiarism</span>
                <div className="mt-0.5"><PlagiarismBadge score={submission.plagiarismScore} /></div>
              </div>
            </div>
          </motion.div>

          {/* PDF viewer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex-wrap gap-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                {submission.renamedFileName || submission.originalFileName}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 hover:bg-primary-100 transition-colors"
                >
                  <HiExternalLink /> Open PDF
                </a>
                <a
                  href={`https://docs.google.com/viewer?url=${encodeURIComponent(submission.fileUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                >
                  <HiExternalLink /> Google Viewer
                </a>
              </div>
            </div>

            {/* Embedded viewer — tries Google Docs approach */}
            <div className="relative w-full h-[580px] lg:h-[680px] bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center gap-4">
              <div className="text-5xl">📄</div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {submission.renamedFileName || 'Submitted PDF'}
              </p>
              <p className="text-xs text-gray-400 text-center max-w-xs">
                Click a button below to view or download the PDF
              </p>
              <div className="flex gap-3 flex-wrap justify-center mt-2">
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors shadow"
                >
                  <HiExternalLink /> Open PDF in New Tab
                </a>
                <a
                  href={`https://docs.google.com/viewer?url=${encodeURIComponent(submission.fileUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow"
                >
                  <HiExternalLink /> View in Google Docs
                </a>
                <a
                  href={submission.fileUrl}
                  download
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-sm font-semibold transition-colors"
                >
                  ⬇ Download PDF
                </a>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Submitted: {format(new Date(submission.submittedAt || submission.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </motion.div>

          {/* Version history */}
          {submission.previousVersions?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5">
              <h3 className="font-display font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Version History</h3>
              <div className="space-y-2">
                {submission.previousVersions.map((v, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">v{v.version} – {v.fileName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">{format(new Date(v.submittedAt), 'MMM d, h:mm a')}</span>
                      <a href={v.fileUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline flex items-center gap-0.5">
                        View <HiExternalLink />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: grading panel */}
        <div className="lg:col-span-2">
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5 space-y-5 sticky top-6"
          >
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <HiStar className="text-primary-600" /> Grade Submission
            </h2>

            {/* Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Marks <span className="text-gray-400 font-normal">(out of {maxMarks})</span>
              </label>
              <input
                type="number"
                value={marks}
                onChange={e => setMarks(e.target.value)}
                min={0}
                max={maxMarks}
                required
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg font-bold"
              />
              {marks !== '' && (
                <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${Number(marks) / maxMarks >= 0.7 ? 'bg-green-500' :
                      Number(marks) / maxMarks >= 0.4 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${Math.min(100, (Number(marks) / maxMarks) * 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                <HiAnnotation /> Feedback
              </label>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                rows={5}
                placeholder="Write feedback for the student..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <div className="flex gap-3">
                {['graded', 'returned'].map(s => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={status === s}
                      onChange={e => setStatus(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-700 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Spinner size="sm" color="white" /> : <HiCheckCircle />}
              {submitting ? 'Saving...' : status === 'returned' ? 'Return Graded' : 'Save Grade'}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
