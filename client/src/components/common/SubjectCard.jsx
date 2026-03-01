import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiTrendingUp, HiFolderOpen, HiDotsVertical, HiDocumentText, HiUsers } from 'react-icons/hi';

const GRADIENTS = [
  'from-emerald-500 to-green-700',
  'from-teal-500 to-cyan-700',
  'from-blue-500 to-indigo-700',
  'from-violet-500 to-purple-700',
  'from-pink-500 to-rose-700',
  'from-amber-500 to-orange-700',
];

const BG_PATTERNS = [
  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
  "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.08' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
];

const SubjectCard = ({ subject, role = 'student', assignmentCount = 0, index = 0 }) => {
  const gradient = GRADIENTS[subject.colorIndex % GRADIENTS.length];
  const pattern  = BG_PATTERNS[index % BG_PATTERNS.length];
  const baseTo   = `/${role}/subjects/${subject._id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300 cursor-pointer group"
    >
      {/* Header */}
      <Link to={baseTo}>
        <div
          className={`relative h-28 bg-gradient-to-br ${gradient} px-4 py-3 overflow-hidden`}
          style={{ backgroundImage: pattern ? `${pattern}` : undefined }}
        >
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: pattern, backgroundSize: '40px 40px' }} />

          <div className="relative">
            <h3 className="font-display font-bold text-white text-base leading-tight line-clamp-2 pr-8">
              {subject.name}
            </h3>
            <p className="text-white/80 text-xs mt-1">{subject.teacher?.name || 'No teacher assigned'}</p>
          </div>

          {/* Subject code badge */}
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-0.5">
            <span className="text-white text-xs font-mono font-semibold">{subject.code}</span>
          </div>

          {/* Avatar circle (like Google Classroom) */}
          <div className="absolute -bottom-4 right-4 w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full border-2 border-white/50 flex items-center justify-center">
            <span className="text-white font-bold text-base">{subject.name?.[0]?.toUpperCase()}</span>
          </div>
        </div>
      </Link>

      {/* Body */}
      <div className="px-4 pt-6 pb-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2rem]">
          {subject.description || 'No description provided.'}
        </p>

        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 dark:text-gray-500">
          {role !== 'teacher' && (
            <span className="flex items-center gap-1">
              <HiUsers className="text-sm" />
              {subject.students?.length || 0} students
            </span>
          )}
          <span className="flex items-center gap-1">
            <HiDocumentText className="text-sm" />
            {assignmentCount} assignments
          </span>
        </div>
      </div>

      {/* Footer action icons */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex gap-1">
          <Link
            to={baseTo}
            className="p-2 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            title="View submissions / analytics"
          >
            <HiTrendingUp className="text-lg" />
          </Link>
          <Link
            to={`${baseTo}?tab=assignments`}
            className="p-2 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            title="View assignments"
          >
            <HiFolderOpen className="text-lg" />
          </Link>
        </div>
        <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <HiDotsVertical className="text-lg" />
        </button>
      </div>
    </motion.div>
  );
};

export default SubjectCard;
