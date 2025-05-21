"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface IPasswordFormWrapperProps {
  albumId?: string;
  onAuthenticated?: () => void;
  children?: React.ReactNode;
}

export default function PasswordFormWrapper({ albumId, onAuthenticated, children }: IPasswordFormWrapperProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/verifyPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          albumId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        if (onAuthenticated) {
          onAuthenticated();
        } else {
          router.push(albumId ? `/albums/${albumId}` : '/admin');
        }
      } else {
        setError(data.message || 'Invalid password');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-primary-900 dark:text-primary-100"
        >
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-3 py-2 border border-primary-300 dark:border-primary-700 rounded-md shadow-sm placeholder-primary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-primary-800 dark:text-primary-100"
            placeholder="Enter album password"
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? 'Verifying...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}