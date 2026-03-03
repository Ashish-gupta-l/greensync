const PlagiarismBadge = ({ score }) => {
  if (score === null || score === undefined) {
    return <span className="text-xs text-gray-400 italic">Checking...</span>;
  }

  const pct = Math.round(score);

  if (pct < 30) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
        {pct}% – Original
      </span>
    );
  }
  if (pct < 60) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
        {pct}% – Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
      {pct}% – High Similarity
    </span>
  );
};

export default PlagiarismBadge;
