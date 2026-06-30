import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { ExpenseFormValues, expenseSchema } from '@/utils/validation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Category, Expense } from '@/types';
import { formatDateInput } from '@/utils/format';

interface ExpenseFormProps {
  categories: Category[];
  initialValues?: Expense;
  onSubmit: (values: ExpenseFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ExpenseForm({
  categories,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: initialValues ? Number(initialValues.amount) : undefined,
      description: initialValues?.description || '',
      category: initialValues?.category || categories[0]?.name || '',
      date: initialValues ? formatDateInput(initialValues.date) : formatDateInput(new Date()),
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        amount: Number(initialValues.amount),
        description: initialValues.description,
        category: initialValues.category,
        date: formatDateInput(initialValues.date),
      });
    }
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Description"
        placeholder="e.g. Grocery shopping"
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount')}
        />
        <Input
          label="Date"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
      </div>
      <Select label="Category" error={errors.category?.message} {...register('category')}>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </Select>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialValues ? 'Save Changes' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
}
