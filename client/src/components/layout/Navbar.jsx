import { useState, useRef, useEffect } from 'react';
import { HiMenuAlt2, HiBell, HiSearch, HiPlus } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { notificationAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const Navbar = ({ setMobileOpen, title = 'GreenSync' }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead, addInitialNotifications } = useSocket();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  // Fetch initial notifications
  useEffect(() => {
    if (user) {
      notificationAPI.getAll()
        .then(({ data }) => addInitialNotifications(data.notifications, data.unreadCount))
        .catch(() => {});
    }
  }, [user]);

  // Close bell on outside click
  useEffect(() => {
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id) => {
    try { await notificationAPI.markRead(id); markRead(id); } catch {}
  };

  const handleMarkAllRead = async () => {
    try { await notificationAPI.markAllRead(); markAllRead(); } catch {}
  };

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 flex-shrink-0 z-30">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <HiMenuAlt2 className="text-xl" />
        </button>
        <h1 className="font-display font-semibold text-gray-800 dark:text-white text-base hidden sm:block">{title}</h1>
      </div>

      {/* Right: notifications + avatar */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen(o => !o)}
            className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <HiBell className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {bellOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="font-semibold text-gray-800 dark:text-white text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-sm">
                      <HiBell className="text-3xl mx-auto mb-2 opacity-30" />
                      No notifications yet
                    </div>
                  ) : notifications.map((n) => (
                    <button
                      key={n._id}
                      onClick={() => handleMarkRead(n._id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-50 dark:border-gray-800 last:border-0 ${!n.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                    >
                      <span className="text-lg mt-0.5">{n.icon || '🔔'}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${!n.read ? 'text-gray-800 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.read && <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer select-none">
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
