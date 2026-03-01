import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
    HiSearch, HiFilter, HiDocumentText, HiExternalLink,
    HiSortAscending, HiSortDescending, HiDownload
} from 'react-icons/hi';
import { submissionAPI } from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import PlagiarismBadge from '../../components/common/PlagiarismBadge';

const STATUS_OPTIONS = ['all', 'submitted', 'late', 'graded', 'returned'];

export default function AllSubmissions() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('submittedAt');
    const [sortDir, setSortDir] = useState('desc');

    useEffect(() => {
        submissionAPI.getAll()           // no params → returns ALL submissions
            .then(({ data }) => setSubmissions(data.submissions || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const toggleSort = (field) => {
        if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(field); setSortDir('asc'); }
    };

    const SortIcon = ({ field }) => {
        if (sortBy !== field) return null;
        return sortDir === 'asc'
            ? <HiSortAscending className="inline text-xs ml-0.5" />
            : <HiSortDescending className="inline text-xs ml-0.5" />;
    };

    const filtered = submissions
        .filter(s => {
            const matchStatus = filter === 'all' || s.status === filter;
            const q = search.toLowerCase();
            const matchSearch = !search
                || s.student?.name?.toLowerCase().includes(q)
                || s.student?.email?.toLowerCase().includes(q)
                || s.assignment?.title?.toLowerCase().includes(q)
                || s.assignment?.subject?.name?.toLowerCase().includes(q);
            return matchStatus && matchSearch;
        })
        .sort((a, b) => {
            let aVal, bVal;
            if (sortBy === 'submittedAt') {
                aVal = new Date(a.submittedAt || a.createdAt);
                bVal = new Date(b.submittedAt || b.createdAt);
            } else if (sortBy === 'name') {
                aVal = a.student?.name?.toLowerCase() || '';
                bVal = b.student?.name?.toLowerCase() || '';
            } else if (sortBy === 'marks') {
                aVal = a.marks ?? -1; bVal = b.marks ?? -1;
            } else if (sortBy === 'plagiarism') {
                aVal = a.plagiarismScore ?? -1; bVal = b.plagiarismScore ?? -1;
            }
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

    if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">All Submissions</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {submissions.length} total · {submissions.filter(s => s.status === 'submitted' || s.status === 'late').length} pending grading
                    </p>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: submissions.length, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
                    { label: 'Pending', value: submissions.filter(s => s.status === 'submitted').length, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
                    { label: 'Late', value: submissions.filter(s => s.status === 'late').length, color: 'bg-red-50 dark:bg-red-900/20 text-red-600' },
                    { label: 'Graded', value: submissions.filter(s => s.status === 'graded' || s.status === 'returned').length, color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
                ].map(({ label, value, color }) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-card"
                    >
                        <div className={`text-2xl font-display font-bold ${color.split(' ').slice(2).join(' ')}`}>{value}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label} Submissions</div>
                    </motion.div>
                ))}
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search student, assignment, subject..."
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                {/* Status filter */}
                <div className="flex items-center gap-2">
                    <HiFilter className="text-gray-400" />
                    <select
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table / cards */}
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
                                    {[
                                        { label: 'Student', field: 'name' },
                                        { label: 'Assignment', field: null },
                                        { label: 'Subject', field: null },
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
                                            className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap ${field ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none' : ''}`}
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
                                        transition={{ delay: i * 0.015 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        {/* Student */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-700 flex-shrink-0">
                                                    {s.student?.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white text-xs whitespace-nowrap">{s.student?.name}</p>
                                                    <p className="text-xs text-gray-400">{s.student?.rollNumber || s.student?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Assignment */}
                                        <td className="px-4 py-3">
                                            <Link
                                                to={`/teacher/assignments/${s.assignment?._id}/submissions`}
                                                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline max-w-[160px] block truncate"
                                            >
                                                {s.assignment?.title || '—'}
                                            </Link>
                                        </td>
                                        {/* Subject */}
                                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {s.assignment?.subject?.name || '—'}
                                        </td>
                                        {/* Status */}
                                        <td className="px-4 py-3"><Badge status={s.status} /></td>
                                        {/* Submitted */}
                                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {format(new Date(s.submittedAt || s.createdAt), 'MMM d, h:mm a')}
                                            {s.version > 1 && <span className="text-gray-400 ml-1">(v{s.version})</span>}
                                        </td>
                                        {/* Marks */}
                                        <td className="px-4 py-3">
                                            {s.marks != null
                                                ? <span className="font-semibold text-primary-600 text-xs">{s.marks}/{s.assignment?.maxMarks}</span>
                                                : <span className="text-gray-400 text-xs">—</span>}
                                        </td>
                                        {/* Plagiarism */}
                                        <td className="px-4 py-3"><PlagiarismBadge score={s.plagiarismScore} /></td>
                                        {/* File */}
                                        <td className="px-4 py-3">
                                            {s.fileUrl
                                                ? <a href={s.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-600 hover:underline text-xs"><HiExternalLink /> View</a>
                                                : '—'}
                                        </td>
                                        {/* Action */}
                                        <td className="px-4 py-3">
                                            <Link
                                                to={`/teacher/submissions/${s._id}/grade`}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors whitespace-nowrap"
                                            >
                                                Grade
                                            </Link>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
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
                                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-700">
                                            {s.student?.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{s.student?.name}</p>
                                            <p className="text-xs text-gray-400">{s.student?.rollNumber || s.student?.email}</p>
                                        </div>
                                    </div>
                                    <Badge status={s.status} />
                                </div>
                                <p className="text-xs font-medium text-primary-600 dark:text-primary-400">{s.assignment?.title}</p>
                                <p className="text-xs text-gray-400">{s.assignment?.subject?.name}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                                    <span>{format(new Date(s.submittedAt || s.createdAt), 'MMM d, h:mm a')}</span>
                                    {s.marks != null && <span className="text-primary-600 font-semibold">{s.marks}/{s.assignment?.maxMarks}</span>}
                                    <PlagiarismBadge score={s.plagiarismScore} />
                                </div>
                                <div className="flex gap-3">
                                    {s.fileUrl && (
                                        <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 flex items-center gap-0.5">
                                            View PDF <HiExternalLink />
                                        </a>
                                    )}
                                    <Link to={`/teacher/submissions/${s._id}/grade`} className="text-xs text-primary-700 font-semibold">Grade →</Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
