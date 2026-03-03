import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  HiArrowLeft, HiUpload, HiDocumentText,
  HiX, HiCheckCircle, HiExternalLink
} from 'react-icons/hi';
import { assignmentAPI, submissionAPI } from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function SubmitAssignment() {
  const { assignmentId } = useParams();
  const navigate         = useNavigate();

  const [assignment,   setAssignment]   = useState(null);
  const [prevSub,      setPrevSub]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [file,         setFile]         = useState(null);
  const [rename,       setRename]       = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [dragOver,     setDragOver]     = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    Promise.all([assignmentAPI.getOne(assignmentId), submissionAPI.getMy()])
      .then(([aRes, sRes]) => {
        const a = aRes.data.assignment;
        setAssignment(a);
        const prev = (sRes.data.submissions || []).find(
          s => (s.assignment?._id || s.assignment) === assignmentId
        );
        setPrevSub(prev || null);
        if (prev) {
          setRename(prev.renamedFileName || prev.originalFileName || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [assignmentId]);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted.');
      return;
    }
    setFile(f);
    if (!rename) {
      setRename(f.name.replace(/\.pdf$/i, ''));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    handleFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a PDF file.'); return; }

    const fd = new FormData();
    fd.append('pdf', file);
    fd.append('assignmentId', assignmentId);
    if (rename.trim()) fd.append('renamedFileName', rename.trim());

    setSubmitting(true);
    try {
      await submissionAPI.submit(fd);
      toast.success('Submission uploaded successfully! 🎉');
      navigate(-1);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!assignment) return <div className="text-center py-20 text-gray-500">Assignment not found.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to={-1} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <HiArrowLeft /> Back
      </Link>

      {/* Assignment info */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-700 rounded-xl flex items-center justify-center">
            <HiDocumentText className="text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{assignment.subject?.name}</p>
            <h1 className="font-display font-bold text-lg text-gray-900 dark:text-white">{assignment.title}</h1>
          </div>
        </div>
        {assignment.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{assignment.description}</p>
        )}
        <div className="flex gap-4 text-xs text-gray-500">
          <span>Due: <strong>{format(new Date(assignment.deadline), 'MMM d, yyyy h:mm a')}</strong></span>
          <span>Max Marks: <strong>{assignment.maxMarks}</strong></span>
          {prevSub && <span>Version: <strong>v{prevSub.version || 1} → v{(prevSub.version || 1) + 1}</strong></span>}
        </div>
      </motion.div>

      {/* Upload form */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-6 space-y-5"
      >
        <h2 className="font-display font-semibold text-gray-900 dark:text-white">
          {prevSub ? 'Resubmit Assignment' : 'Submit Assignment'}
        </h2>

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
            ${dragOver
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : file
              ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
              : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0])}
          />

          <AnimatePresence mode="wait">
            {file ? (
              <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <HiCheckCircle className="text-4xl text-primary-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setFile(null); }}
                  className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center gap-1 mx-auto"
                >
                  <HiX /> Remove
                </button>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <HiUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                <p className="font-semibold text-gray-600 dark:text-gray-400 text-sm">
                  Drop your PDF here or <span className="text-primary-600">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF only · Max 10 MB</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rename field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            File Name <span className="text-xs text-gray-400">(optional – will be auto-named if empty)</span>
          </label>
          <div className="flex items-center">
            <input
              type="text"
              value={rename}
              onChange={e => setRename(e.target.value)}
              placeholder="e.g. AmitGupta_Physics_Assignment1"
              className="flex-1 px-4 py-2.5 rounded-l-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <span className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-xl text-sm text-gray-500">.pdf</span>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting || !file}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-700 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? <Spinner size="sm" color="white" /> : <HiUpload />}
          {submitting ? 'Uploading...' : prevSub ? 'Resubmit' : 'Submit Assignment'}
        </button>
      </motion.form>

      {/* Previous submission info */}
      {prevSub && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5">
          <h3 className="font-display font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">
            Previous Submission
          </h3>
          <a
            href={prevSub.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
          >
            <HiExternalLink /> {prevSub.renamedFileName || prevSub.originalFileName}
          </a>
          <p className="text-xs text-gray-400 mt-1">
            v{prevSub.version || 1} · {format(new Date(prevSub.submittedAt || prevSub.createdAt), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
      )}
    </div>
  );
}
