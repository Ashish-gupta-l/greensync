import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPlus, HiPencil, HiTrash, HiX, HiSearch,
  HiUsers, HiAcademicCap, HiUserAdd, HiUserRemove
} from 'react-icons/hi';
import { subjectAPI, userAPI } from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const emptyForm = { name: '', code: '', description: '', colorIndex: 0 };

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create / edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Assign teacher modal
  const [teacherModal, setTeacherModal] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');

  // Enroll student modal
  const [enrollModal, setEnrollModal] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');

  const fetchAll = async () => {
    try {
      const [sRes, tRes, stRes] = await Promise.all([
        subjectAPI.getAll(),
        userAPI.getAll({ role: 'teacher' }),
        userAPI.getAll({ role: 'student' }),
      ]);
      setSubjects(sRes.data.subjects || []);
      setTeachers(tRes.data.users || []);
      setStudents(stRes.data.users || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // CRUD
  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, code: s.code, description: s.description || '', colorIndex: s.colorIndex || 0 }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data } = await subjectAPI.update(editing._id, form);
        setSubjects(prev => prev.map(s => s._id === editing._id ? data.subject : s));
        toast.success('Subject updated.');
      } else {
        const { data } = await subjectAPI.create(form);
        setSubjects(prev => [...prev, data.subject]);
        toast.success('Subject created.');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this subject?')) return;
    try { await subjectAPI.remove(id); setSubjects(prev => prev.filter(s => s._id !== id)); toast.success('Subject deactivated.'); } catch { toast.error('Failed.'); }
  };

  // Assign teacher
  const handleAssignTeacher = async () => {
    if (!selectedTeacher || !teacherModal) return;
    try {
      const { data } = await subjectAPI.assignTeacher(teacherModal._id, { teacherId: selectedTeacher });
      setSubjects(prev => prev.map(s => s._id === teacherModal._id ? { ...s, teacher: data.subject.teacher } : s));
      toast.success('Teacher assigned.');
      setTeacherModal(null);
    } catch { toast.error('Failed to assign.'); }
  };

  // Enroll student
  const handleEnrollStudent = async () => {
    if (!selectedStudent || !enrollModal) return;
    try {
      await subjectAPI.enrollStudent(enrollModal._id, { studentId: selectedStudent });
      // Refresh that subject
      const { data } = await subjectAPI.getOne(enrollModal._id);
      setSubjects(prev => prev.map(s => s._id === enrollModal._id ? data.subject : s));
      toast.success('Student enrolled.');
      setSelectedStudent('');
    } catch { toast.error('Failed to enroll.'); }
  };

  const handleUnenrollStudent = async (subjectId, studentId) => {
    try {
      await subjectAPI.unenrollStudent(subjectId, { studentId });
      setSubjects(prev => prev.map(s => {
        if (s._id === subjectId) {
          return { ...s, students: (s.students || []).filter(st => (st._id || st) !== studentId) };
        }
        return s;
      }));
      toast.success('Student removed.');
    } catch { toast.error('Failed.'); }
  };

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Manage Subjects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subjects.length} subjects</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors">
          <HiPlus /> Create Subject
        </button>
      </div>

      <div className="relative max-w-sm">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subjects..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      {/* Subject cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-card">
            <div className="text-5xl mb-3">📚</div>
            <p className="text-gray-500 dark:text-gray-400">No subjects found.</p>
          </div>
        ) : filtered.map((s, i) => (
          <motion.div
            key={s._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-lg text-xs font-mono font-bold">{s.code}</span>
                  <h3 className="font-display font-semibold text-gray-900 dark:text-white text-sm">{s.name}</h3>
                </div>
                {s.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{s.description}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><HiPencil /></button>
                <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><HiTrash /></button>
              </div>
            </div>

            {/* Teacher */}
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-xs">
                <HiAcademicCap className="text-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  {s.teacher?.name || <span className="italic text-gray-400">No teacher</span>}
                </span>
              </div>
              <button
                onClick={() => { setTeacherModal(s); setSelectedTeacher(s.teacher?._id || ''); }}
                className="text-xs text-primary-600 hover:underline font-medium"
              >
                {s.teacher ? 'Change' : 'Assign'}
              </button>
            </div>

            {/* Students */}
            <div className="py-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs">
                  <HiUsers className="text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">{s.students?.length || 0} students</span>
                </div>
                <button
                  onClick={() => { setEnrollModal(s); setSelectedStudent(''); }}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:underline font-medium"
                >
                  <HiUserAdd /> Enroll
                </button>
              </div>
              {s.students?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {s.students.map(st => {
                    const name = typeof st === 'object' ? st.name : st;
                    const id = typeof st === 'object' ? st._id : st;
                    return (
                      <span key={id} className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1 text-xs text-gray-700 dark:text-gray-300">
                        {typeof st === 'object' ? st.name : id}
                        <button
                          onClick={() => handleUnenrollStudent(s._id, id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <HiX className="text-xs" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Subject Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">{editing ? 'Edit Subject' : 'Create Subject'}</h2>
                  <button type="button" onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600"><HiX className="text-xl" /></button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code *</label>
                  <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required placeholder="e.g. CS301"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color Theme</label>
                  <div className="flex gap-2">
                    {['bg-emerald-500', 'bg-teal-500', 'bg-blue-500', 'bg-violet-500', 'bg-pink-500', 'bg-amber-500'].map((c, idx) => (
                      <button key={idx} type="button" onClick={() => setForm(f => ({ ...f, colorIndex: idx }))}
                        className={`w-8 h-8 rounded-lg ${c} ${form.colorIndex === idx ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white' : ''} transition-all`} />
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={saving}
                  className="w-full py-2.5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Spinner size="sm" color="white" /> : null}
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Assign Teacher Modal */}
      <AnimatePresence>
        {teacherModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setTeacherModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">Assign Teacher</h2>
                  <button onClick={() => setTeacherModal(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600"><HiX /></button>
                </div>
                <p className="text-xs text-gray-500">Subject: <strong>{teacherModal.name}</strong></p>
                <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Select teacher...</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
                </select>
                <button onClick={handleAssignTeacher} disabled={!selectedTeacher}
                  className="w-full py-2.5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors">
                  Assign
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Enroll Student Modal */}
      <AnimatePresence>
        {enrollModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setEnrollModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">Enroll Student</h2>
                  <button onClick={() => setEnrollModal(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600"><HiX /></button>
                </div>
                <p className="text-xs text-gray-500">Subject: <strong>{enrollModal.name}</strong></p>
                <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Select student...</option>
                  {students
                    .filter(st => !(enrollModal.students || []).some(es => (es._id || es) === st._id))
                    .map(st => <option key={st._id} value={st._id}>{st.name} ({st.rollNumber || st.email})</option>)}
                </select>
                <button onClick={handleEnrollStudent} disabled={!selectedStudent}
                  className="w-full py-2.5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors">
                  Enroll
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
