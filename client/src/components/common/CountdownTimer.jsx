import { useCountdown } from '../../hooks/useCountdown';

const CountdownTimer = ({ deadline, compact = false }) => {
  const { days, hours, minutes, seconds, expired } = useCountdown(deadline);

  if (expired) {
    return (
      <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
        <span>⚠</span> Deadline passed
      </span>
    );
  }

  if (compact) {
    if (days > 0) return <span className="text-xs text-gray-500 dark:text-gray-400">{days}d {hours}h left</span>;
    if (hours > 0) return <span className="text-xs text-orange-500 font-medium">{hours}h {minutes}m left</span>;
    return <span className="text-xs text-red-500 font-bold animate-pulse">{minutes}m {seconds}s left</span>;
  }

  const isUrgent = days === 0 && hours < 6;

  return (
    <div className={`flex items-center gap-2 ${isUrgent ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
      <span className="text-sm">{isUrgent ? '🔥' : '⏰'}</span>
      <div className="flex gap-1.5 text-xs font-mono font-bold">
        {days > 0 && (
          <span className="bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1">{days}d</span>
        )}
        <span className="bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1">{String(hours).padStart(2,'0')}h</span>
        <span className="bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1">{String(minutes).padStart(2,'0')}m</span>
        <span className={`rounded-lg px-2 py-1 ${isUrgent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
          {String(seconds).padStart(2,'0')}s
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;
