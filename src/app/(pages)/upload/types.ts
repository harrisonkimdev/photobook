export interface AlbumFormData {
  title: string;
  thumbnail: File | null;
  description: string;
  password: string;
  photos: File[];
  isPublic: boolean;
}

export interface FormState {
  hasAccess: boolean;
  thumbnailImageUrl: string;
  thumbnailFeedback: string;
  photosFeedback: string;
  isSubmitting: boolean;
  error: string;
}

export interface FileInputButtonProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  multiple: boolean;
}
