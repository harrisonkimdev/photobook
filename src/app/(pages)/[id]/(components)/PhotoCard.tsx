"use client"

import { useEffect, useState, useCallback, useRef } from "react";
import { CldImage } from "next-cloudinary";
import { HiChatBubbleBottomCenterText } from "react-icons/hi2";
import { IPhoto, IComment } from "@/interfaces";
import CommentContainer from "@/app/(pages)/[id]/(components)/CommentContainer";
import { imageTransformationConfig, CLOUD_NAME } from "@/utils/cloudinaryConfig";
import { calculateImageSize, preloadImage, getImagePlaceholder } from "@/utils/imageOptimization";
import { useToast } from "@/app/(components)/ToastContext";

const fetchComments = async (photoId: string): Promise<IComment[]> => {
  try {
    const res = await fetch(`/api/comments?photoId=${photoId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error("Error fetching comments");
    }

    const { comments } = await res.json();
    return comments;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const getTopComment = (comments: IComment[]): IComment | null => {
  if (!comments.length) return null;
  return comments.reduce((prev, current) => 
    (prev.vote > current.vote) ? prev : current
  );
};

const handleImageClick = (filename: string) => {
  const img = new window.Image();
  img.src = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v1/photobook-9mo4/${filename}`;
  img.style.maxWidth = "95vw";
  img.style.maxHeight = "95vh";
  const viewer = window.open("", "_blank");
  viewer?.document.write(img.outerHTML);
  viewer?.document.close();
};

interface PhotoCardProps {
  photo: IPhoto;
}

const PhotoCard = ({ photo }: PhotoCardProps) => {
  const [flip, setFlip] = useState(false);
  const [topComment, setTopComment] = useState<IComment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const loadComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedComments = await fetchComments(photo._id);
      setTopComment(getTopComment(fetchedComments));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments");
      showToast("Failed to load comments", "error");
    } finally {
      setIsLoading(false);
    }
  }, [photo._id, showToast]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    const updateImageSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setImageSize(calculateImageSize(containerWidth));
      }
    };

    updateImageSize();
    window.addEventListener('resize', updateImageSize);
    return () => window.removeEventListener('resize', updateImageSize);
  }, []);

  useEffect(() => {
    const preloadNextImage = async () => {
      try {
        await preloadImage(`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v1/photobook-9mo4/${photo.filename}`);
      } catch (err) {
        console.error('Failed to preload image:', err);
      }
    };

    preloadNextImage();
  }, [photo.filename]);

  return (
    <div className="h-[32rem] md:h-[42rem] lg:h-[46rem]" ref={containerRef}>
      {!flip ? (
        <div className="flex flex-col gap-3">
          <div className="p-4 flex flex-col bg-stone-50 dark:bg-stone-800 rounded-lg shadow-sm">
            {/* photos */}
            <div className="relative">
              <CldImage 
                src={`/photobook-9mo4/${photo.filename}`}
                alt={`photo-${photo._id}`}
                width={imageSize.width || imageTransformationConfig.mobile.width}
                height={imageSize.height || imageTransformationConfig.mobile.width * 0.75}
                crop="fill"
                quality={imageTransformationConfig.mobile.quality}
                format={imageTransformationConfig.mobile.format}
                className="w-full h-auto cursor-pointer transition-opacity duration-300 rounded-lg"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError("Failed to load image");
                  showToast("Failed to load image", "error");
                }}
                onClick={() => handleImageClick(photo.filename)}
                placeholder="blur"
                blurDataURL={getImagePlaceholder(
                  imageSize.width || imageTransformationConfig.mobile.width,
                  imageSize.height || imageTransformationConfig.mobile.width * 0.75
                )}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-stone-700 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 dark:border-stone-200"></div>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-red-500 dark:text-red-400">{error}</p>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/50 dark:bg-white/50 px-2 py-1 rounded text-xs text-white dark:text-black cursor-pointer">
                Click to enlarge
              </div>
            </div>
            {/* top comment */}
            <div className="h-full pt-8 pb-4 flex justify-center items-center text-xl text-stone-800 dark:text-stone-200" style={{ fontFamily: "'Dancing Script', cursive" }}>
              {isLoading ? (
                <div className="animate-pulse">Loading comments...</div>
              ) : error ? (
                <div className="text-red-500 dark:text-red-400">{error}</div>
              ) : (
                topComment?.text ?? "No comments available yet"
              )}
            </div>
          </div>

          {/* chat bubble */}
          <div className="mx-2 flex justify-end">
            <button
              onClick={() => setFlip(true)}
              className="p-2 rounded-full font-medium text-white bg-stone-500 hover:bg-stone-600 dark:bg-stone-600 dark:hover:bg-stone-700 transition-colors duration-200"
              aria-label="View comments"
            >
              <HiChatBubbleBottomCenterText className="text-xl" />
            </button>
          </div>
        </div>
      ) : (
        <CommentContainer photoId={photo._id} toggleShowPhoto={() => setFlip(false)} />
      )}
    </div>
  );
};

export default PhotoCard;
