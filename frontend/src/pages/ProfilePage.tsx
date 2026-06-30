import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { usersApi } from '@/api/users';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  ChangePasswordFormValues,
  changePasswordSchema,
  ProfileFormValues,
  profileSchema,
} from '@/utils/validation';
import { getErrorMessage } from '@/api/client';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) });

  const onProfileSubmit = async (values: ProfileFormValues) => {
    setIsProfileSubmitting(true);
    try {
      const updated = await usersApi.updateProfile(values);
      setUser(updated);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const onPasswordSubmit = async (values: ChangePasswordFormValues) => {
    setIsPasswordSubmitting(true);
    try {
      await usersApi.changePassword(values);
      toast.success('Password changed successfully');
      resetPasswordForm();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account information and security
        </p>
      </div>

      <Card>
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-xl font-semibold text-white">
            {initials}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            error={profileErrors.name?.message}
            {...registerProfile('name')}
          />
          <Input
            label="Email"
            type="email"
            error={profileErrors.email?.message}
            {...registerProfile('email')}
          />
          <div className="flex justify-end">
            <Button type="submit" isLoading={isProfileSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
          Change Password
        </h2>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            error={passwordErrors.currentPassword?.message}
            {...registerPassword('currentPassword')}
          />
          <Input
            label="New Password"
            type="password"
            error={passwordErrors.newPassword?.message}
            {...registerPassword('newPassword')}
          />
          <Input
            label="Confirm New Password"
            type="password"
            error={passwordErrors.confirmPassword?.message}
            {...registerPassword('confirmPassword')}
          />
          <div className="flex justify-end">
            <Button type="submit" isLoading={isPasswordSubmitting}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
