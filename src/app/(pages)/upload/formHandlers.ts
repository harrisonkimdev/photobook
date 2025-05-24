"use client";

import { AlbumFormData, FormState } from "./types";
import { Dispatch, SetStateAction, useCallback } from "react";
import { useRouter } from "next/navigation";

export const useFormHandlers = (
  formData: AlbumFormData,
  setFormData: Dispatch<SetStateAction<AlbumFormData>>,
  state: FormState,
  setState: Dispatch<SetStateAction<FormState>>,
) => {
  const router = useRouter();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }, [setFormData]);

  const handleThumbnailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setState(prevState => ({ ...prevState, thumbnailFeedback: 'NOPE: 파일이 선택되지 않았습니다.' }));
      return;
    }
    
    // 파일 타입과 크기 검증 (최대 5MB)
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validImageTypes.includes(file.type)) {
      setFormData(prevState => ({ ...prevState, thumbnail: null }));
      setState(prevState => ({
        ...prevState,
        thumbnailImageUrl: "",
        thumbnailFeedback: 'NOPE: JPG, PNG, WebP, GIF 형식만 허용됩니다.'
      }));
      return;
    }
    
    if (file.size > maxSize) {
      setFormData(prevState => ({ ...prevState, thumbnail: null }));
      setState(prevState => ({
        ...prevState,
        thumbnailImageUrl: "",
        thumbnailFeedback: 'NOPE: 이미지 크기는 5MB 이하여야 합니다.'
      }));
      return;
    }
    
    setFormData(prevState => ({ ...prevState, thumbnail: file }));
    setState(prevState => ({
      ...prevState,
      thumbnailImageUrl: URL.createObjectURL(file),
      thumbnailFeedback: 'OK: 이미지가 선택되었습니다.'
    }));
  }, [setFormData, setState]);

  const handlePhotosChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setState(prevState => ({ ...prevState, photosFeedback: 'NOPE: 선택된 파일이 없습니다.' }));
      return;
    }
    
    // 파일 타입과 크기 검증 (최대 10MB)
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const filesArray = Array.from(files);
    const validFiles = filesArray.filter(file => {
      if (!validImageTypes.includes(file.type)) return false;
      if (file.size > maxSize) return false;
      return true;
    });
    
    if (validFiles.length === 0) {
      setFormData(prevState => ({ ...prevState, photos: [] }));
      setState(prevState => ({
        ...prevState,
        photosFeedback: 'NOPE: 유효한 이미지 파일이 없습니다. (JPG, PNG, WebP, GIF 형식, 10MB 이하)'
      }));
      return;
    }
    
    setFormData(prevState => ({
      ...prevState,
      photos: validFiles
    }));
    
    const invalidCount = filesArray.length - validFiles.length;
    if (invalidCount > 0) {
      setState(prevState => ({
        ...prevState,
        photosFeedback: `OK: ${validFiles.length}개 파일 선택됨. ${invalidCount}개 파일은 형식이나 크기 문제로 제외됨.`
      }));
    } else {
      setState(prevState => ({
        ...prevState,
        photosFeedback: `OK: ${validFiles.length}개 파일이 선택되었습니다.`
      }));
    }
  }, [setState, setFormData]);

  const handleTogglePublic = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      isPublic: !prev.isPublic
    }));
  }, [setFormData]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 폼 유효성 검사
    if (!formData.title.trim()) {
      setState(prev => ({ ...prev, error: '제목을 입력해주세요.' }));
      return;
    }

    if (!formData.thumbnail) {
      setState(prev => ({ ...prev, error: '썸네일 이미지를 선택해주세요.' }));
      return;
    }

    if (formData.photos.length === 0) {
      setState(prev => ({ ...prev, error: '최소 한 장 이상의 사진을 선택해주세요.' }));
      return;
    }

    // 제출 중 상태로 변경
    setState(prev => ({ ...prev, isSubmitting: true, error: '' }));

    const data = new FormData();
    data.append("title", formData.title.trim());
    data.append("thumbnail", formData.thumbnail);
    data.append("description", formData.description);
    
    if (formData.password) {
      data.append("password", formData.password);
    }
    
    // isPublic 필드 추가
    data.append("isPublic", formData.isPublic.toString());
    
    // 모든 사진 추가
    formData.photos.forEach(photo => {
      data.append("photos", photo);
    });

    try {
      const response = await fetch('/api/albums', {
        method: 'POST',
        body: data
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '앨범 생성에 실패했습니다.');
      }

      console.log('앨범이 성공적으로 생성되었습니다:', result);
      
      // 생성된 앨범으로 이동
      router.push(`/`);
    } catch (error) {
      console.error('폼 제출 오류:', error);
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      }));
    }
  }, [formData, router, setState]);

  const getFeedbackStyle = (feedback: string) => {
    return feedback.startsWith('NOPE') ? 'text-red-500' : 'text-green-500';
  };

  return {
    handleInputChange,
    handleThumbnailChange,
    handlePhotosChange,
    handleTogglePublic,
    handleSubmit,
    getFeedbackStyle
  };
};
