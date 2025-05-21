'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { SubmitButton } from './submit-button';
import { toast } from './toast';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const code = searchParams.get('code');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!email || !code) {
    return (
      <div className="flex flex-col items-center gap-6 px-4 sm:px-16">
        <div className="text-center">
          <h3 className="text-lg font-semibold dark:text-zinc-50">Invalid Reset Link</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            This password reset link is invalid. Please try the password reset process again.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Back to Password Reset
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword.length < 8) {
      toast({
        type: 'error',
        description: 'Password must be at least 8 characters long'
      });
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        type: 'error',
        description: 'Passwords do not match'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });

      if (response.ok) {
        toast({
          type: 'success',
          description: 'Password has been reset successfully!'
        });
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const data = await response.json();
        toast({
          type: 'error',
          description: data.error || 'Failed to reset password'
        });
      }
    } catch (error) {
      toast({
        type: 'error',
        description: 'An error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-4">
        <div>
          <Label
            htmlFor="newPassword"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
            New Password
          </Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            className="bg-muted text-md md:text-sm mt-2"
            placeholder="Enter new password"
            required
            autoFocus
          />
        </div>

        <div>
          <Label
            htmlFor="confirmPassword"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="bg-muted text-md md:text-sm mt-2"
            placeholder="Confirm new password"
            required
          />
        </div>

        <p className="text-xs text-gray-500 dark:text-zinc-400">
          Password must be at least 8 characters long.
        </p>
      </div>

      <SubmitButton isSubmitting={isSubmitting}>
        Reset Password
      </SubmitButton>

      <div className="mt-4 text-center">
        <Link
          href="/login"
          className="text-sm text-gray-600 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}
