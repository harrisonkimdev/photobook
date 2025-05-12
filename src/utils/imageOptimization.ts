import { imageTransformationConfig } from './cloudinaryConfig';

export interface ImageSize {
  width: number;
  height: number;
}

export const calculateImageSize = (containerWidth: number, aspectRatio: number = 0.75): ImageSize => {
  const width = Math.min(containerWidth, imageTransformationConfig.mobile.width);
  const height = width * aspectRatio;
  return { width, height };
};

export const generateImageUrl = (
  filename: string,
  options: {
    width?: number;
    quality?: number;
    format?: string;
  } = {}
) => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  const transformations = [
    options.width ? `w_${options.width}` : '',
    options.quality ? `q_${options.quality}` : '',
    options.format ? `f_${options.format}` : '',
  ].filter(Boolean).join(',');

  return `${baseUrl}/${transformations ? `t_${transformations}/` : ''}photobook-9mo4/${filename}`;
};

export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

export const getImagePlaceholder = (width: number, height: number): string => {
  return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"%3E%3Crect width="100%" height="100%" fill="%23f3f4f6"/%3E%3C/svg%3E`;
};

export const getResponsiveImageSizes = (): string => {
  const sizes = [
    { width: 640, size: '100vw' },
    { width: 1024, size: '50vw' },
    { width: 1280, size: '33vw' },
  ];

  return sizes
    .map(({ width, size }) => `(min-width: ${width}px) ${size}`)
    .concat(['100vw'])
    .join(', ');
}; 