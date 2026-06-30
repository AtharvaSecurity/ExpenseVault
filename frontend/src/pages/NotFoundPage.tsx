import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-950">
      <p className="text-6xl font-bold text-primary-600">404</p>
      <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
