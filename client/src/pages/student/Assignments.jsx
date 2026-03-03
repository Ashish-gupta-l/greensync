import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';
import { HiClipboardList, HiArrowRight, HiFilter, HiSearch } from 'react-icons/hi';
import { assignmentAPI, submissionAPI } from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

const STATUS = {
    overdue: { label: 'Overdue', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
    urgent: { label: 'Due Soon', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
    pending: { label: 'Pending', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
    submitted: { label: 'Submitted', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
};

function getStatus(assignment, submittedIds) {
    if (submittedIds.has(assignment._id)) return 'submitted';
    const deadline = new Date(assignment.deadline);
    if (isPast(deadline)) return 'overdue';
    if (deadline - new Date() < 48 * 60 * 60 * 1000) return 'urgent';
    return 'pending';
}

export default function Assignments() {
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        Promise.all([assignmentAPI.getAll(), submissionAPI.getMy()])
            .then(([aRes, sRes]) => {
                setAssignments(aRes.data.assignments || []);
                setSubmissions(sRes.data.submissions || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const submittedIds = new Set(submissions.map(s => s.assignment?._id || s.assignment));

    const filtered = assignments
        .filter(a => filter === 'all' || getStatus(a, submittedIds) === filter)
        .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.subject?.name?.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Assignments</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{assignments.length} total assignments</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[180px]">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search assignments..."
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <HiFilter className="text-gray-400" />
                    {['all', 'pending', 'urgent', 'overdue', 'submitted'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${filter === f
                                    ? 'bg-primary-600 text-white shadow'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cards */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl shadow-card">
                    <div className="text-5xl mb-3">📋</div>
                    <p className="text-gray-500 dark:text-gray-400">No assignments found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((a, i) => {
                        const status = getStatus(a, submittedIds);
                        const { label, color } = STATUS[status];
                        const deadline = new Date(a.deadline);
                        return (
                            <motion.div
                                key={a._id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                                        <HiClipboardList className="text-primary-600 text-lg" />
                                    </div>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>{label}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white leading-snug">{a.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.subject?.name || 'Unknown Subject'}</p>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{a.description}</p>
                                <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
                                    <span className={`text-xs font-medium ${isPast(deadline) ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                        📅 {format(deadline, 'MMM d, yyyy')}
                                    </span>
                                    <span className="text-xs text-gray-400">Max: {a.maxMarks} marks</span>
                                </div>
                                {status !== 'submitted' && (
                                    <Link
                                        to={`/student/assignments/${a._id}/submit`}
                                        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
                                    >
                                        Submit PDF <HiArrowRight />
                                    </Link>
                                )}
                                {status === 'submitted' && (
                                    <div className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-semibold">
                                        ✅ Submitted
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
