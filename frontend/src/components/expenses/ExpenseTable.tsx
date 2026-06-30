import { Expense } from '@/types';
import { formatCurrency, formatDate, getCategoryColor } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Loaders';

interface ExpenseTableProps {
  expenses: Expense[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function SortHeader({
  label,
  field,
  sortBy,
  sortOrder,
  onSort,
}: {
  label: string;
  field: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}) {
  const isActive = sortBy === field;
  return (
    <th
      className="cursor-pointer select-none px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
      </span>
    </th>
  );
}

export function ExpenseTable({
  expenses,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange,
}: ExpenseTableProps) {
  if (isLoading) {
    return (
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <EmptyState
        title="No expenses found"
        description="Try adjusting your filters or add a new expense to get started."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <SortHeader label="Date" field="date" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Description
              </th>
              <SortHeader label="Category" field="category" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              <SortHeader label="Amount" field="amount" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(expense.date)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {expense.description}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: getCategoryColor(expense.category) }}
                  >
                    {expense.category}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                  <button
                    onClick={() => onEdit(expense)}
                    className="mr-3 font-medium text-primary-600 hover:text-primary-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(expense)}
                    className="font-medium text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
