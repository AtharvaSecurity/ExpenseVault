import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { categoriesApi } from '@/api/categories';
import { Category } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { CategoryFormValues, categorySchema } from '@/utils/validation';
import { getErrorMessage } from '@/api/client';
import { EmptyState } from '@/components/ui/EmptyState';

const PRESET_COLORS = [
  '#F97316',
  '#3B82F6',
  '#EC4899',
  '#8B5CF6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#06B6D4',
  '#64748B',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [deletingCategory, setDeletingCategory] = useState<Category | undefined>(undefined);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', color: PRESET_COLORS[0] },
  });
  const selectedColor = watch('color');

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoriesApi.list();
      setCategories(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateForm = () => {
    setEditingCategory(undefined);
    reset({ name: '', color: PRESET_COLORS[0] });
    setIsFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    reset({ name: category.name, color: category.color });
    setIsFormOpen(true);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, values);
        toast.success('Category updated');
      } else {
        await categoriesApi.create(values);
        toast.success('Category created');
      }
      setIsFormOpen(false);
      loadCategories();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      await categoriesApi.remove(deletingCategory.id);
      toast.success('Category deleted');
      setDeletingCategory(undefined);
      loadCategories();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Organize your expenses with custom categories
          </p>
        </div>
        <Button onClick={openCreateForm}>+ Add Category</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : !categories.length ? (
        <EmptyState title="No categories yet" description="Create your first category." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="h-8 w-8 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-gray-900 dark:text-gray-100">{cat.name}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditForm(cat)}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeletingCategory(cat)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" placeholder="e.g. Travel" error={errors.name?.message} {...register('name')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setValue('color', color, { shouldValidate: true })}
                  className={`h-8 w-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-900 dark:border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            {errors.color?.message && (
              <p className="mt-1 text-sm text-red-500">{errors.color.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(undefined)}
        title="Delete Category"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to delete{' '}
          <span className="font-semibold">{deletingCategory?.name}</span>?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeletingCategory(undefined)}>
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
