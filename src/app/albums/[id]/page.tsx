'use client';

import { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import Navigation from '@/app/(components)/(layouts)/Navigation';
import { IAlbum } from '@/types/album';
import { useParams } from 'next/navigation';
import PasswordFormWrapper from '@/app/(components)/PasswordFormWrapper';

export default function AlbumPage() {
  const { id } = useParams();
  const [album, setAlbum] = useState<IAlbum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const response = await fetch(`/api/albums/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch album');
        }
        const data = await response.json();
        setAlbum(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAlbum();
    }
  }, [id]);

  const handleAuthentication = () => {
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 dark:bg-primary-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-primary-200 dark:bg-primary-700 rounded w-1/3 mb-4" />
            <div className="h-4 bg-primary-200 dark:bg-primary-700 rounded w-1/4 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-primary-200 dark:bg-primary-700 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-50 dark:bg-primary-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
              Error Loading Album
            </h2>
            <p className="text-primary-600 dark:text-primary-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-primary-50 dark:bg-primary-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
              Album Not Found
            </h2>
            <p className="text-primary-600 dark:text-primary-300">
              The album you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (album.password && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary-50 dark:bg-primary-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
                Protected Album
              </h2>
              <p className="text-primary-600 dark:text-primary-300">
                This album is password protected. Please enter the password to view its contents.
              </p>
            </div>
            <PasswordFormWrapper
              albumId={album._id}
              onAuthenticated={handleAuthentication}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-900 dark:text-white mb-4">
            {album.title}
          </h1>
          <p className="text-xl text-primary-600 dark:text-primary-300">
            {new Date(album.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {album.photos.map((photo, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg shadow-lg"
            >
              <CldImage
                src={photo}
                alt={`Photo ${index + 1}`}
                width="800"
                height="800"
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 