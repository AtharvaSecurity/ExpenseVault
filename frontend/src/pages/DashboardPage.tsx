import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { expensesApi } from '@/api/expenses';
import { DashboardStats, MonthlyTrendPoint } from '@/types';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Loaders';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { formatCurrency, formatDate, getCategoryColor } from '@/utils/format';
import { getErrorMessage } from '@/api/client';
import { EmptyState } from '@/components/ui/EmptyState';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trend, setTrend] = useState<MonthlyTrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [statsData, trendData] = await Promise.all([
          expensesApi.dashboardStats(),
          expensesApi.monthlyTrend(6),
        ]);
        setStats(statsData);
        setTrend(trendData);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    {
      label: 'Total Expenses',
      value: stats?.totalExpenses ?? 0,
      color: 'text-primary-600',
    },
    {
      label: 'This Month',
      value: stats?.monthlyExpenses ?? 0,
      color: 'text-emerald-600',
    },
    {
      label: 'This Week',
      value: stats?.weeklyExpenses ?? 0,
      color: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Overview of your spending activity
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card) => (
              <Card key={card.label}>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.label}
                </p>
                <p className={`mt-2 text-2xl font-bold ${card.color}`}>
                  {formatCurrency(card.value)}
                </p>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
            Category Breakdown
          </h2>
          {isLoading ? (
            <div className="skeleton h-64 w-full" />
          ) : (
            <CategoryPieChart data={stats?.categoryBreakdown ?? []} />
          )}
        </Card>
        <Card>
          <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
            6-Month Trend
          </h2>
          {isLoading ? (
            <div className="skeleton h-64 w-full" />
          ) : (
            <MonthlyTrendChart data={trend} />
          )}
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Recent Transactions
          </h2>
          <Link
            to="/expenses"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : !stats?.recentTransactions.length ? (
          <EmptyState
            title="No transactions yet"
            description="Add your first expense to see it here."
          />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {stats.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: getCategoryColor(tx.category) }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {tx.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {tx.category} · {formatDate(tx.date)}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
