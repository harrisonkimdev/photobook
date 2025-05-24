'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';
import Navigation from '../../../(components)/(layouts)/Navigation';

export default function CreateAlbumPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [password, setPassword] = useState('');
  const [thumbnailImage, setThumbnailImage] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          date,
          password: password || undefined,
          thumbnailImage,
          photos,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/albums/${data._id}`);
      } else {
        setError(data.message || 'Failed to create album');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-900 dark:text-white mb-4">
            Create New Album
          </h1>
          <p className="text-xl text-primary-600 dark:text-primary-300">
            Share your memories with friends and family
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-primary-900 dark:text-primary-100"
            >
              Album Title
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="title"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full px-3 py-2 border border-primary-300 dark:border-primary-700 rounded-md shadow-sm placeholder-primary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-primary-800 dark:text-primary-100"
                placeholder="Enter album title"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-primary-900 dark:text-primary-100"
            >
              Date
            </label>
            <div className="mt-1">
              <input
                type="date"
                id="date"
                name="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full px-3 py-2 border border-primary-300 dark:border-primary-700 rounded-md shadow-sm placeholder-primary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-primary-800 dark:text-primary-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-primary-900 dark:text-primary-100"
            >
              Password (Optional)
            </label>
            <div className="mt-1">
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-primary-300 dark:border-primary-700 rounded-md shadow-sm placeholder-primary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-primary-800 dark:text-primary-100"
                placeholder="Enter album password"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 dark:text-primary-100 mb-2">
              Thumbnail Image
            </label>
            <CldUploadWidget
              uploadPreset="photobook"
              onSuccess={(result) => {
                if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
                  setThumbnailImage(result.info.secure_url as string);
                }
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="w-full px-4 py-2 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-md text-primary-600 dark:text-primary-400 hover:border-primary-400 dark:hover:border-primary-600 transition-colors duration-200"
                >
                  {thumbnailImage ? 'Change Thumbnail' : 'Upload Thumbnail'}
                </button>
              )}
            </CldUploadWidget>
            {thumbnailImage && (
              <div className="mt-4">
                <img
                  src={thumbnailImage}
                  alt="Thumbnail preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 dark:text-primary-100 mb-2">
              Photos
            </label>
            <CldUploadWidget
              uploadPreset="photobook"
              onSuccess={(result) => {
                if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
                  setPhotos((prev) => [...prev, result.info.secure_url as string]);
                }
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="w-full px-4 py-2 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-md text-primary-600 dark:text-primary-400 hover:border-primary-400 dark:hover:border-primary-600 transition-colors duration-200"
                >
                  Upload Photos
                </button>
              )}
            </CldUploadWidget>
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !title || !date || !thumbnailImage || photos.length === 0}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Creating...' : 'Create Album'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 