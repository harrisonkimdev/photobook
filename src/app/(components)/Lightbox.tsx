"use client";

import { useState, useEffect, useCallback } from "react";
import { CldImage } from "next-cloudinary";
import { IImage } from "@/interfaces";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface LightboxProps {
  images: IImage[];
  initialIndex: number;
  onClose: () => void;
}

export default function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  const [startDistance, setStartDistance] = useState<number | null>(null);

  // 현재 이미지
  const currentImage = images[currentIndex];

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; // 스크롤 방지

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = ""; // 스크롤 복원
    };
  }, [currentIndex]);

  // 이미지 로드 완료 처리
  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // 이전 이미지로 이동
  const goToPrevious = useCallback(() => {
    if (scale !== 1) return; // 확대 상태에서는 이동 불가
    setIsLoading(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length, scale]);

  // 다음 이미지로 이동
  const goToNext = useCallback(() => {
    if (scale !== 1) return; // 확대 상태에서는 이동 불가
    setIsLoading(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length, scale]);

  // 터치 시작 처리
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // 단일 터치 (스와이프용)
      setTouchStart(e.touches[0].clientX);
      setTouchEnd(null);
    } else if (e.touches.length === 2) {
      // 두 손가락 터치 (핀치 줌)
      setIsPinching(true);
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setStartDistance(distance);
    }
  }, []);

  // 터치 이동 처리
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isPinching && e.touches.length === 2 && startDistance) {
        // 핀치 줌 처리
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const newScale = Math.max(1, Math.min(3, (scale * distance) / startDistance));
        setScale(newScale);
        setStartDistance(distance);
      } else if (e.touches.length === 1) {
        // 스와이프 처리
        setTouchEnd(e.touches[0].clientX);
      }
    },
    [isPinching, startDistance, scale]
  );

  // 터치 종료 처리
  const handleTouchEnd = useCallback(() => {
    setIsPinching(false);
    setStartDistance(null);

    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && scale === 1) {
      goToNext();
    } else if (isRightSwipe && scale === 1) {
      goToPrevious();
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, goToNext, goToPrevious, scale]);

  // 더블 탭으로 확대/축소
  const handleDoubleTap = useCallback(() => {
    setScale(scale === 1 ? 2 : 1);
  }, [scale]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* 닫기 버튼 */}
      <button 
        className="absolute top-4 right-4 z-10 text-white p-2 rounded-full bg-black bg-opacity-50"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <FiX size={24} />
      </button>

      {/* 이미지 컨테이너 */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleTap}
      >
        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* 이미지 */}
        <div 
          className="transition-transform duration-200 ease-out"
          style={{ 
            transform: `scale(${scale})`,
            maxWidth: "100%",
            maxHeight: "100%"
          }}
        >
          <CldImage
            src={currentImage.url}
            alt={currentImage.caption || `사진 ${currentIndex + 1}`}
            width={1200}
            height={1200}
            onLoad={handleImageLoad}
            className="object-contain max-h-screen"
            sizes="100vw"
            priority
          />
        </div>

        {/* 이미지 캡션 */}
        {currentImage.caption && (
          <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black bg-opacity-50 py-2 px-4">
            <p>{currentImage.caption}</p>
          </div>
        )}

        {/* 이미지 카운터 */}
        <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* 이전/다음 버튼 (데스크톱용) */}
        <button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black bg-opacity-50 hidden md:block"
          onClick={(e) => {
            e.stopPropagation();
            goToPrevious();
          }}
        >
          <FiChevronLeft size={24} />
        </button>
        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black bg-opacity-50 hidden md:block"
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
        >
          <FiChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
