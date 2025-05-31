'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { SubmitButton } from './submit-button';
import { toast } from './toast';

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const [resetCode, setResetCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVerifying && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      // Generate and set random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setResetCode(code);
      toast({ 
        type: 'success', 
        description: 'Your reset code has been generated.' 
      });
    }
    return () => clearInterval(timer);
  }, [isVerifying, countdown]);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/forgot-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsVerifying(true);
        toast({ 
          type: 'success', 
          description: 'If an account exists with this email, you will receive a reset code shortly.' 
        });
      } else {
        toast({ 
          type: 'error', 
          description: 'This email is not registered in our system.' 
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

  const handleCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (resetCode !== generatedCode) {
      toast({ 
        type: 'error', 
        description: 'Invalid reset code. Please try again.' 
      });
      return;
    }

    // Valid code, redirect to reset password page
    router.push(`/reset-password?email=${encodeURIComponent(email)}&code=${resetCode}`);
  };

  if (!isVerifying) {
    return (
      <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="email"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
            Email Address
          </Label>

          <Input
            id="email"
            name="email"
            className="bg-muted text-md md:text-sm"
            type="email"
            placeholder="user@acme.com"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">
          Enter your email address to receive a reset code.
        </p>

        <SubmitButton isSubmitting={isSubmitting}>
          Request Password Reset
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

  return (
    <form onSubmit={handleCodeSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="code"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Reset Code
        </Label>

        <Input
          id="code"
          name="code"
          className="bg-muted text-md md:text-sm"
          type="text"
          placeholder="Enter reset code"
          required
          value={resetCode}
          onChange={(e) => setResetCode(e.target.value)}
          disabled={countdown > 0}
        />

        {countdown > 0 && (
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Generating reset code in {countdown} seconds...
          </p>
        )}
      </div>

      <SubmitButton disabled={countdown > 0 || !resetCode}>
        Verify Code
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
