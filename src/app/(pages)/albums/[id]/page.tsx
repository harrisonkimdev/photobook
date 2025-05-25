'use client';

import { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import Navigation from '@/app/(components)/(layouts)/Navigation';
import { useParams, useSearchParams } from 'next/navigation';
import PasswordFormWrapper from '@/app/(components)/PasswordFormWrapper';
import Lightbox from '@/app/(components)/Lightbox';
import { IAlbum } from '@/interfaces';

interface AlbumResponse {
  album: IAlbum;
  requiresPassword: boolean;
}

export default function AlbumPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const accessUrl = searchParams.get('accessUrl');
  
  const [albumData, setAlbumData] = useState<AlbumResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // 라이트박스 상태
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        // accessUrl이 있으면 쿼리 파라미터로 추가
        const url = accessUrl
          ? `/api/albums/${id}?accessUrl=${accessUrl}`
          : `/api/albums/${id}`;
          
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('앨범을 불러오는데 실패했습니다');
        }
        
        const data = await response.json();
        setAlbumData(data);
        
        // 비밀번호가 필요하지 않거나 이미 인증된 경우
        if (!data.requiresPassword) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('앨범 조회 오류:', err);
        setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAlbum();
    }
  }, [id, accessUrl]);

  const handleAuthentication = () => {
    // 인증 성공 시 페이지 새로고침
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              앨범 로딩 오류
            </h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!albumData || !albumData.album) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              앨범을 찾을 수 없습니다
            </h2>
            <p className="text-gray-600">
              찾으시는 앨범이 존재하지 않거나 삭제되었습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { album } = albumData;

  // 비밀번호 보호 앨범이고 인증되지 않은 경우
  if (albumData.requiresPassword && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {album.title}
              </h2>
              <p className="text-gray-600 mb-2">
                이 앨범은 비밀번호로 보호되어 있습니다.
              </p>
              <p className="text-gray-500 text-sm">
                내용을 보려면 비밀번호를 입력해주세요.
              </p>
            </div>
            <PasswordFormWrapper
              albumId={album._id.toString()}
              onAuthenticated={handleAuthentication}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {album.title}
          </h1>
          {album.description && (
            <p className="text-xl text-gray-600 mb-4">{album.description}</p>
          )}
          <p className="text-sm text-gray-500">
            {new Date(album.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {album.photos && album.photos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {album.photos.map((photo, index) => (
                <div
                  key={index}
                  className="group relative aspect-square overflow-hidden rounded-lg shadow-lg cursor-pointer"
                  onClick={() => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                >
                  <CldImage
                    src={photo.url}
                    alt={photo.caption || `사진 ${index + 1}`}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  
                  {/* 모바일에서 탭 힌트 표시 */}
                  <div className="absolute inset-0 flex items-center justify-center md:hidden">
                    <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      탭하여 확대
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 라이트박스 */}
            {lightboxOpen && (
              <Lightbox
                images={album.photos}
                initialIndex={lightboxIndex}
                onClose={() => setLightboxOpen(false)}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">이 앨범에는 사진이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
} 