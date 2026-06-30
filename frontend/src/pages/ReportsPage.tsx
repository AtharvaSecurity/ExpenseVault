import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { reportsApi } from '@/api/reports';
import { CategoryAnalytics } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency, downloadBlob, getCategoryColor } from '@/utils/format';
import { getErrorMessage } from '@/api/client';
import { EmptyState } from '@/components/ui/EmptyState';

function getDefaultStartDate() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split('T')[0];
}

function getDefaultEndDate() {
  return new Date().toISOString().split('T')[0];
}

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  const [analytics, setAnalytics] = useState<CategoryAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState<'csv' | 'pdf' | null>(null);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await reportsApi.categoryAnalytics({ startDate, endDate });
      setAnalytics(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async (type: 'csv' | 'pdf') => {
    setIsExporting(type);
    try {
      const blob =
        type === 'csv'
          ? await reportsApi.exportCsv({ startDate, endDate })
          : await reportsApi.exportPdf({ startDate, endDate });
      downloadBlob(blob, `expenses-report.${type}`);
      toast.success(`Report exported as ${type.toUpperCase()}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsExporting(null);
    }
  };

  const total = analytics.reduce((sum, a) => sum + a.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Analyze your spending and export reports
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button onClick={loadAnalytics}>Apply Filters</Button>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={() => handleExport('csv')}
          isLoading={isExporting === 'csv'}
        >
          Export CSV
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleExport('pdf')}
          isLoading={isExporting === 'pdf'}
        >
          Export PDF
        </Button>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Category Analytics
          </h2>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total: {formatCurrency(total)}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-10 w-full" />
            ))}
          </div>
        ) : !analytics.length ? (
          <EmptyState
            title="No data for this period"
            description="Try selecting a different date range."
          />
        ) : (
          <div className="space-y-4">
            {analytics
              .sort((a, b) => b.total - a.total)
              .map((item) => (
                <div key={item.category}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {item.category}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {formatCurrency(item.total)} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: getCategoryColor(item.category),
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}
