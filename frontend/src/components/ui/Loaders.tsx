export function Spinner({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin text-primary-600 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <Spinner className="h-10 w-10" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="skeleton h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-3 w-1/4" />
      </div>
      <div className="skeleton h-4 w-16" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="skeleton mb-3 h-4 w-1/2" />
      <div className="skeleton h-8 w-1/3" />
    </div>
  );
}
