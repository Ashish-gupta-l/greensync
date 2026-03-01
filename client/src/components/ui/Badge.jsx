const variants = {
  submitted: 'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400',
  pending:   'bg-gray-100  text-gray-600  dark:bg-gray-800     dark:text-gray-400',
  late:      'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400',
  graded:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  returned:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  admin:     'bg-red-100   text-red-700',
  teacher:   'bg-blue-100  text-blue-700',
  student:   'bg-green-100 text-green-700',
};

const icons = {
  submitted: '✓',
  pending:   '⏳',
  late:      '⚠',
  graded:    '🎯',
  returned:  '↩',
};

const Badge = ({ status, label, size = 'sm' }) => {
  const cls = variants[status] || 'bg-gray-100 text-gray-600';
  const icon = icons[status] || '';
  const sizeCls = size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium capitalize ${cls} ${sizeCls}`}>
      {icon && <span className="text-xs">{icon}</span>}
      {label || status}
    </span>
  );
};

export default Badge;
