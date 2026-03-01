import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    isSameDay, isToday, isPast, getDay, addMonths, subMonths
} from 'date-fns';
import { HiChevronLeft, HiChevronRight, HiClipboardList, HiPlus } from 'react-icons/hi';
import { assignmentAPI } from '../../services/api';
import Spinner from '../../components/ui/Spinner';

export default function TeacherCalendar() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        assignmentAPI.getAll()
            .then(({ data }) => setAssignments(data.assignments || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startPad = getDay(monthStart);

    const assignmentsOnDay = (day) =>
        assignments.filter(a => isSameDay(new Date(a.deadline), day));

    const selectedAssignments = selected ? assignmentsOnDay(selected) : [];

    if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Calendar</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Assignment deadlines overview</p>
                </div>
                <Link
                    to="/teacher/assignments/create"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
                >
                    <HiPlus /> Create Assignment
                </Link>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                                <HiChevronLeft />
                            </button>
                            <button onClick={() => setCurrentMonth(new Date())} className="px-3 h-8 text-xs font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                                Today
                            </button>
                            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                                <HiChevronRight />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
                        {days.map(day => {
                            const dayAssigns = assignmentsOnDay(day);
                            const isSelected = selected && isSameDay(day, selected);
                            const overdue = dayAssigns.some(a => isPast(new Date(a.deadline)));
                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => setSelected(isSelected ? null : day)}
                                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-start p-1 text-xs font-medium transition-all
                    ${isSelected ? 'bg-primary-600 text-white shadow-lg scale-105' : isToday(day) ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                >
                                    <span>{format(day, 'd')}</span>
                                    {dayAssigns.length > 0 && (
                                        <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                                            {dayAssigns.slice(0, 3).map((_, idx) => (
                                                <span key={idx} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : overdue ? 'bg-red-500' : 'bg-primary-500'}`} />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5">
                    {selected ? (
                        <>
                            <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-1">{format(selected, 'EEEE, MMM d')}</h3>
                            <p className="text-xs text-gray-500 mb-4">{selectedAssignments.length} assignment{selectedAssignments.length !== 1 ? 's' : ''} due</p>
                            {selectedAssignments.length === 0 ? (
                                <div className="text-center py-8"><div className="text-3xl mb-2">📅</div><p className="text-sm text-gray-400">No assignments due</p></div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedAssignments.map(a => (
                                        <motion.div key={a._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2">
                                            <div className="flex items-start gap-2">
                                                <HiClipboardList className="text-primary-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{a.title}</p>
                                                    <p className="text-xs text-gray-500">{a.subject?.name}</p>
                                                </div>
                                            </div>
                                            <Link to={`/teacher/assignments/${a._id}/submissions`} className="block text-center text-xs font-semibold py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition">
                                                View Submissions
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Upcoming Deadlines</h3>
                            <div className="space-y-3">
                                {assignments
                                    .filter(a => !isPast(new Date(a.deadline)))
                                    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                                    .slice(0, 6)
                                    .map(a => (
                                        <div key={a._id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                                                <HiClipboardList className="text-primary-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{a.title}</p>
                                                <p className="text-xs text-gray-400">{a.subject?.name}</p>
                                            </div>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">{format(new Date(a.deadline), 'MMM d')}</span>
                                        </div>
                                    ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
