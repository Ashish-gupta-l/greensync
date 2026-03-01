import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    isSameDay, isToday, isPast, getDay, addMonths, subMonths
} from 'date-fns';
import { HiChevronLeft, HiChevronRight, HiClipboardList } from 'react-icons/hi';
import { assignmentAPI, submissionAPI } from '../../services/api';
import Spinner from '../../components/ui/Spinner';

export default function Calendar() {
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selected, setSelected] = useState(null);

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

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad start of calendar to correct weekday
    const startPad = getDay(monthStart); // 0 = Sun

    const assignmentsOnDay = (day) =>
        assignments.filter(a => isSameDay(new Date(a.deadline), day));

    const selectedAssignments = selected ? assignmentsOnDay(selected) : [];

    if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Calendar</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your assignment deadlines</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Calendar Grid */}
                <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5">
                    {/* Month nav */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                            >
                                <HiChevronLeft />
                            </button>
                            <button
                                onClick={() => setCurrentMonth(new Date())}
                                className="px-3 h-8 text-xs font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                            >
                                <HiChevronRight />
                            </button>
                        </div>
                    </div>

                    {/* Day labels */}
                    <div className="grid grid-cols-7 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty pads */}
                        {Array.from({ length: startPad }).map((_, i) => (
                            <div key={`pad-${i}`} />
                        ))}
                        {days.map(day => {
                            const dayAssigns = assignmentsOnDay(day);
                            const isSelected = selected && isSameDay(day, selected);
                            const overdue = dayAssigns.some(a => isPast(new Date(a.deadline)) && !submittedIds.has(a._id));
                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => setSelected(isSelected ? null : day)}
                                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-start p-1 text-xs font-medium transition-all
                    ${isSelected ? 'bg-primary-600 text-white shadow-lg scale-105' : isToday(day) ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-300 dark:border-primary-700' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                  `}
                                >
                                    <span>{format(day, 'd')}</span>
                                    {dayAssigns.length > 0 && (
                                        <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                                            {dayAssigns.slice(0, 3).map((_, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : overdue ? 'bg-red-500' : 'bg-primary-500'}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary-500 inline-block" /> Deadline</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Overdue</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-primary-500 inline-block" /> Today</span>
                    </div>
                </div>

                {/* Sidebar: selected day or upcoming */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5">
                    {selected ? (
                        <>
                            <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-1">
                                {format(selected, 'EEEE, MMM d')}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                {selectedAssignments.length} assignment{selectedAssignments.length !== 1 ? 's' : ''} due
                            </p>
                            {selectedAssignments.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-3xl mb-2">✅</div>
                                    <p className="text-sm text-gray-400">No assignments due</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedAssignments.map(a => {
                                        const done = submittedIds.has(a._id);
                                        return (
                                            <motion.div
                                                key={a._id}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <HiClipboardList className="text-primary-500 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{a.title}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{a.subject?.name}</p>
                                                    </div>
                                                </div>
                                                {done ? (
                                                    <span className="text-xs text-green-600 font-semibold">✅ Submitted</span>
                                                ) : (
                                                    <Link
                                                        to={`/student/assignments/${a._id}/submit`}
                                                        className="block text-center text-xs font-semibold py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition"
                                                    >
                                                        Submit PDF
                                                    </Link>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Upcoming Deadlines</h3>
                            <div className="space-y-3">
                                {assignments
                                    .filter(a => !isPast(new Date(a.deadline)) && !submittedIds.has(a._id))
                                    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                                    .slice(0, 6)
                                    .map(a => (
                                        <div key={a._id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                                                <HiClipboardList className="text-primary-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{a.title}</p>
                                                <p className="text-xs text-gray-400">{a.subject?.name}</p>
                                            </div>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">{format(new Date(a.deadline), 'MMM d')}</span>
                                        </div>
                                    ))}
                                {assignments.filter(a => !isPast(new Date(a.deadline)) && !submittedIds.has(a._id)).length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-sm">🎉 All caught up!</div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
