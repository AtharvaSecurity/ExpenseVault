import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { expensesApi, ExpenseQueryParams } from '@/api/expenses';
import { categoriesApi } from '@/api/categories';
import { Category, Expense } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ExpenseTable } from '@/components/expenses/ExpenseTable';
import { ExpenseFormValues } from '@/utils/validation';
import { getErrorMessage } from '@/api/client';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [deletingExpense, setDeletingExpense] = useState<Expense | undefined>(undefined);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => undefined);
  }, []);

  const loadExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: ExpenseQueryParams = {
        search: debouncedSearch || undefined,
        category: categoryFilter || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 10,
      };
      const result = await expensesApi.list(params);
      setExpenses(result.items);
      setTotalPages(result.meta.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, categoryFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const openCreateForm = () => {
    setEditingExpense(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleSubmit = async (values: ExpenseFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingExpense) {
        await expensesApi.update(editingExpense.id, values);
        toast.success('Expense updated');
      } else {
        await expensesApi.create(values);
        toast.success('Expense added');
      }
      setIsFormOpen(false);
      loadExpenses();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingExpense) return;
    try {
      await expensesApi.remove(deletingExpense.id);
      toast.success('Expense deleted');
      setDeletingExpense(undefined);
      loadExpenses();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Expenses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage and track all your expenses
          </p>
        </div>
        <Button onClick={openCreateForm}>+ Add Expense</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <ExpenseTable
        expenses={expenses}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={openEditForm}
        onDelete={setDeletingExpense}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
      >
        <ExpenseForm
          categories={categories}
          initialValues={editingExpense}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(undefined)}
        title="Delete Expense"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to delete{' '}
          <span className="font-semibold">{deletingExpense?.description}</span>? This action
          cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeletingExpense(undefined)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
