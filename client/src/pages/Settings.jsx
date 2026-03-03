import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiUser, HiLockClosed, HiBell, HiColorSwatch, HiCheck } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                <Icon className="text-primary-600 text-lg" />
            </div>
            <h2 className="font-display font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        {children}
    </div>
);

const Field = ({ label, children }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {children}
    </div>
);

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all";

export default function Settings() {
    const { user, updateUser } = useAuth();
    const { dark, toggleDark } = useTheme();

    const [name, setName] = useState(user?.name || '');
    const [department, setDepartment] = useState(user?.department || '');
    const [rollNumber, setRollNumber] = useState(user?.rollNumber || '');
    const [saving, setSaving] = useState(false);
    const [savedOk, setSavedOk] = useState(false);

    const [curPwd, setCurPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [pwdSaving, setPwdSaving] = useState(false);

    const [notifEmail, setNotifEmail] = useState(true);
    const [notifDeadline, setNotifDeadline] = useState(true);
    const [notifGrades, setNotifGrades] = useState(true);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await authAPI.updateProfile({ name, department, rollNumber });
            updateUser(data.user);
            setSavedOk(true);
            toast.success('Profile updated!');
            setTimeout(() => setSavedOk(false), 2000);
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPwd !== confirmPwd) { toast.error('Passwords do not match'); return; }
        if (newPwd.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setPwdSaving(true);
        try {
            await authAPI.updateProfile({ currentPassword: curPwd, newPassword: newPwd });
            toast.success('Password changed!');
            setCurPwd(''); setNewPwd(''); setConfirmPwd('');
        } catch {
            toast.error('Failed to change password. Check your current password.');
        } finally {
            setPwdSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences</p>
            </div>

            {/* Profile */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                <Section title="Profile Information" icon={HiUser}>
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                            {user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role} · {user?.email}</p>
                        </div>
                    </div>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <Field label="Full Name">
                            <input value={name} onChange={e => setName(e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Department">
                            <input value={department} onChange={e => setDepartment(e.target.value)} className={inputClass} />
                        </Field>
                        {user?.role === 'student' && (
                            <Field label="Roll Number">
                                <input value={rollNumber} onChange={e => setRollNumber(e.target.value)} className={inputClass} />
                            </Field>
                        )}
                        <Field label="Email (read-only)">
                            <input value={user?.email || ''} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
                        </Field>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold transition-all"
                        >
                            {saving ? <Spinner size="sm" color="white" /> : savedOk ? <HiCheck /> : null}
                            {saving ? 'Saving...' : savedOk ? 'Saved!' : 'Save Changes'}
                        </button>
                    </form>
                </Section>
            </motion.div>

            {/* Password */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                <Section title="Change Password" icon={HiLockClosed}>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <Field label="Current Password">
                            <input type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)} required className={inputClass} />
                        </Field>
                        <Field label="New Password">
                            <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required minLength={6} className={inputClass} />
                        </Field>
                        <Field label="Confirm New Password">
                            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required className={inputClass} />
                        </Field>
                        <button
                            type="submit"
                            disabled={pwdSaving}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold transition-all"
                        >
                            {pwdSaving ? <Spinner size="sm" color="white" /> : null}
                            {pwdSaving ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </Section>
            </motion.div>

            {/* Notifications */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <Section title="Notifications" icon={HiBell}>
                    <div className="space-y-4">
                        {[
                            { label: 'Email notifications', sub: 'Receive emails for updates', val: notifEmail, set: setNotifEmail },
                            { label: 'Deadline reminders', sub: 'Get reminded before due dates', val: notifDeadline, set: setNotifDeadline },
                            { label: 'Grade notifications', sub: 'Notify when assignments are graded', val: notifGrades, set: setNotifGrades },
                        ].map(({ label, sub, val, set }) => (
                            <div key={label} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</p>
                                    <p className="text-xs text-gray-400">{sub}</p>
                                </div>
                                <button
                                    onClick={() => { set(v => !v); toast.success('Preference saved'); }}
                                    className={`w-11 h-6 rounded-full relative transition-colors ${val ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${val ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </Section>
            </motion.div>

            {/* Appearance */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                <Section title="Appearance" icon={HiColorSwatch}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Dark Mode</p>
                            <p className="text-xs text-gray-400">Switch between light and dark themes</p>
                        </div>
                        <button
                            onClick={toggleDark}
                            className={`w-11 h-6 rounded-full relative transition-colors ${dark ? 'bg-primary-600' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${dark ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </Section>
            </motion.div>
        </div>
    );
}
