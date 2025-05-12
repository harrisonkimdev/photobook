// 클라이언트 사이드 설정
export interface CloudinaryConfig {
  mobile: {
    width: number;
    quality: number;
    format: string;
    fetchFormat: string;
  };
  thumbnail: {
    width: number;
    quality: number;
    format: string;
    fetchFormat: string;
  };
}

export const imageTransformationConfig: CloudinaryConfig = {
  mobile: {
    width: 800,
    quality: 80,
    format: 'webp',
    fetchFormat: 'auto'
  },
  thumbnail: {
    width: 400,
    quality: 60,
    format: 'webp',
    fetchFormat: 'auto'
  }
};

export const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;