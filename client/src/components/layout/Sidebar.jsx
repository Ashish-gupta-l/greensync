import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome, HiCalendar, HiBookOpen, HiClipboardList,
  HiCog, HiChartBar, HiUsers, HiAcademicCap,
  HiChevronDown, HiChevronUp, HiMenuAlt2, HiX,
  HiLogout, HiDocumentText
} from 'react-icons/hi';
import { GiTreeBranch } from 'react-icons/gi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const CARD_GRADIENTS = [
  'bg-card-gradient',   // green
  'bg-card-gradient-2', // teal
  'bg-card-gradient-3', // blue
  'bg-card-gradient-4', // purple
  'bg-card-gradient-5', // pink
  'bg-card-gradient-6', // amber
];

const SubjectDot = ({ name, colorIndex = 0 }) => {
  const colors = ['bg-primary-600', 'bg-forest-600', 'bg-blue-600', 'bg-violet-600', 'bg-pink-600', 'bg-amber-600'];
  return (
    <span className={`w-7 h-7 rounded-full ${colors[colorIndex % 6]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {name?.[0]?.toUpperCase() || 'S'}
    </span>
  );
};

const Sidebar = ({ subjects = [], mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const navigate = useNavigate();

  const [teachingOpen, setTeachingOpen] = useState(true);
  const [enrolledOpen, setEnrolledOpen]  = useState(true);

  const basePath = `/${user?.role}`;

  // Navigation items per role
  const topLinks = user?.role === 'admin'
    ? [
        { to: `${basePath}`,          icon: HiHome,          label: 'Home' },
        { to: `${basePath}/subjects`,  icon: HiBookOpen,      label: 'Subjects' },
        { to: `${basePath}/students`,  icon: HiUsers,         label: 'Students' },
        { to: `${basePath}/teachers`,  icon: HiAcademicCap,   label: 'Teachers' },
        { to: `${basePath}/analytics`, icon: HiChartBar,      label: 'Analytics' },
        { to: `${basePath}/settings`,  icon: HiCog,           label: 'Settings' },
      ]
    : user?.role === 'teacher'
    ? [
        { to: `${basePath}`,              icon: HiHome,          label: 'Home' },
        { to: `${basePath}/assignments`,  icon: HiClipboardList, label: 'Assignments' },
        { to: `${basePath}/submissions`,  icon: HiDocumentText,  label: 'Submissions' },
        { to: `${basePath}/calendar`,     icon: HiCalendar,      label: 'Calendar' },
        { to: `${basePath}/settings`,     icon: HiCog,           label: 'Settings' },
      ]
    : [
        { to: `${basePath}`,              icon: HiHome,          label: 'Home' },
        { to: `${basePath}/assignments`,  icon: HiClipboardList, label: 'Assignments' },
        { to: `${basePath}/submissions`,  icon: HiDocumentText,  label: 'My Submissions' },
        { to: `${basePath}/calendar`,     icon: HiCalendar,      label: 'Calendar' },
        { to: `${basePath}/settings`,     icon: HiCog,           label: 'Settings' },
      ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <NavLink to={`/${user?.role}`} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-card-gradient rounded-lg flex items-center justify-center">
            <GiTreeBranch className="text-white text-xl" />
          </div>
          <span className="font-display font-bold text-lg text-primary-700 dark:text-primary-400">
            GreenSync
          </span>
        </NavLink>
        {/* Mobile close */}
        <button onClick={() => setMobileOpen(false)} className="md:hidden p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
          <HiX className="text-xl" />
        </button>
      </div>

      {/* Top Nav Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {topLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === `/${user?.role}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
              ${isActive
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <Icon className="text-lg flex-shrink-0" />
            {label}
          </NavLink>
        ))}

        {/* Subject sections for teachers/students */}
        {user?.role === 'teacher' && subjects.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setTeachingOpen(o => !o)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hover:text-gray-700 dark:hover:text-gray-200"
            >
              Teaching
              {teachingOpen ? <HiChevronUp /> : <HiChevronDown />}
            </button>
            <AnimatePresence>
              {teachingOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden space-y-0.5"
                >
                  {subjects.map((s, i) => (
                    <NavLink
                      key={s._id}
                      to={`/teacher/subjects/${s._id}`}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150
                        ${isActive ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`
                      }
                    >
                      <SubjectDot name={s.name} colorIndex={s.colorIndex} />
                      <span className="truncate text-xs font-medium">{s.name}</span>
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {user?.role === 'student' && subjects.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setEnrolledOpen(o => !o)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hover:text-gray-700 dark:hover:text-gray-200"
            >
              Enrolled
              {enrolledOpen ? <HiChevronUp /> : <HiChevronDown />}
            </button>
            <AnimatePresence>
              {enrolledOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden space-y-0.5"
                >
                  {subjects.map((s) => (
                    <NavLink
                      key={s._id}
                      to={`/student/subjects/${s._id}`}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150
                        ${isActive ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`
                      }
                    >
                      <SubjectDot name={s.name} colorIndex={s.colorIndex} />
                      <span className="truncate text-xs font-medium">{s.name}</span>
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </nav>

      {/* Bottom: user + dark mode + logout */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-1">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span>{dark ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
          <div className={`w-10 h-5 rounded-full transition-colors relative ${dark ? 'bg-primary-600' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${dark ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </button>

        {/* User info + logout */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="p-1 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <HiLogout className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 h-full">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-64 z-50 md:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
