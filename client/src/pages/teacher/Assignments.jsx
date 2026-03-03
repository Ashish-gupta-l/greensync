import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, isPast } from 'date-fns';
import { HiClipboardList, HiPlus, HiSearch, HiTrash, HiEye } from 'react-icons/hi';
import { assignmentAPI } from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function TeacherAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        assignmentAPI.getAll()
            .then(({ data }) => setAssignments(data.assignments || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this assignment?')) return;
        try {
            await assignmentAPI.remove(id);
            setAssignments(prev => prev.filter(a => a._id !== id));
            toast.success('Assignment deleted');
        } catch {
            toast.error('Failed to delete assignment');
        }
    };

    const filtered = assignments.filter(a =>
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.subject?.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Assignments</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{assignments.length} total assignments</p>
                </div>
                <Link
                    to="/teacher/assignments/create"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors shadow"
                >
                    <HiPlus className="text-lg" /> Create Assignment
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search assignments..."
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl shadow-card">
                    <div className="text-5xl mb-3">📋</div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No assignments yet.</p>
                    <Link
                        to="/teacher/assignments/create"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold"
                    >
                        <HiPlus /> Create First Assignment
                    </Link>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    {['Assignment', 'Subject', 'Deadline', 'Max Marks', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filtered.map((a, i) => {
                                    const overdue = isPast(new Date(a.deadline));
                                    return (
                                        <motion.tr
                                            key={a._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                                                        <HiClipboardList className="text-primary-600" />
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-[180px]">{a.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{a.subject?.name || '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-medium ${overdue ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                                                    {format(new Date(a.deadline), 'MMM d, yyyy')}
                                                    {overdue && ' (Overdue)'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.maxMarks}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${overdue ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                                                    {overdue ? 'Closed' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        to={`/teacher/assignments/${a._id}/submissions`}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                                        title="View Submissions"
                                                    >
                                                        <HiEye className="text-base" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(a._id)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <HiTrash className="text-base" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
