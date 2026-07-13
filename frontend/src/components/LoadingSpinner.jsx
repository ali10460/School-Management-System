const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-5 w-5 border-2', md: 'h-8 w-8 border-3', lg: 'h-12 w-12 border-4' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} rounded-full border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 animate-spin`} />
    </div>
  );
};

export const PageLoading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <LoadingSpinner size="lg" />
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 6 }) => (
  <div className="animate-pulse">
    <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-4 skeleton flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-700/50">
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="h-4 skeleton flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export default LoadingSpinner;
