'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import Navigation from '@/app/(components)/(layouts)/Navigation';
import { IAlbum } from '@/types/album';

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<IAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        console.log('Fetching albums...');
        const response = await fetch('/api/albums');
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Failed to fetch albums');
        }
        
        const data = await response.json();
        console.log('API Response data:', data);
        console.log('Albums array:', data.albums);
        
        if (!Array.isArray(data.albums)) {
          console.error('Albums data is not an array:', data.albums);
          throw new Error('Invalid albums data format');
        }
        
        setAlbums(data.albums);
      } catch (err) {
        console.error('Error in fetchAlbums:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 dark:bg-primary-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-primary-800 rounded-lg shadow-lg p-6">
                <div className="h-48 bg-primary-200 dark:bg-primary-700 rounded-lg mb-4" />
                <div className="h-6 bg-primary-200 dark:bg-primary-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-primary-200 dark:bg-primary-700 rounded w-1/2" />
              </div>
            ))}
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
              Error Loading Albums
            </h2>
            <p className="text-primary-600 dark:text-primary-300">{error}</p>
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
            Photo Albums
          </h1>
          <p className="text-xl text-primary-600 dark:text-primary-300">
            Browse through our collection of beautiful photo albums
          </p>
        </div>

        {albums.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-primary-600 dark:text-primary-300">
              No albums found. Be the first to create one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album) => (
              <div key={album._id} className="group relative block overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-xl dark:bg-gray-800">
                <Link href={`/albums/${album._id}`} className="block">
                  <div className="relative h-48 overflow-hidden">
                    {album.thumbnailImage?.url && (
                      <CldImage
                        src={album.thumbnailImage.url}
                        alt={album.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                        crop="fill"
                        gravity="auto"
                        quality="80"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-primary-900 dark:text-white mb-2">
                      {album.title}
                    </h2>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                      {new Date(album.date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </p>
                    {album.description && (
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                        {album.description}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 