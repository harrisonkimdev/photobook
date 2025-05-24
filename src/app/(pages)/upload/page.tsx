"use client";

import { useState } from "react";
import PasswordFormWrapper from "@/app/(components)/PasswordFormWrapper";
import Image from "next/image";
import FileInputButton from "./FileInput";
import { AlbumFormData, FormState } from "./types";
import { useFormHandlers } from "./formHandlers";

const UploadPage = () => {
  const [formData, setFormData] = useState<AlbumFormData>({
    title: "",
    thumbnail: null,
    description: "",
    password: "",
    photos: [],
    isPublic: false,
  });

  const [state, setState] = useState<FormState>({
    hasAccess: false,
    thumbnailImageUrl: "",
    thumbnailFeedback: "",
    photosFeedback: "",
    isSubmitting: false,
    error: ""
  });

  const {
    handleInputChange,
    handleThumbnailChange,
    handlePhotosChange,
    handleTogglePublic,
    handleSubmit,
    getFeedbackStyle
  } = useFormHandlers(formData, setFormData, state, setState);

  return (
    <PasswordFormWrapper albumId={null}>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6 w-full max-w-lg">
          <h2 className="text-2xl font-bold text-center text-gray-700">새 앨범 만들기</h2>
          
          {/* 오류 메시지 */}
          {state.error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-center">
              {state.error}
            </div>
          )}
          
          <input 
            type="text" 
            name="title"
            placeholder="앨범 제목" 
            value={formData.title} 
            onChange={handleInputChange} 
            className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300"
            disabled={state.isSubmitting}
          />
          
          <FileInputButton 
            onChange={handleThumbnailChange} 
            label="썸네일 이미지 선택" 
            multiple={false} 
          />
          
          {state.thumbnailImageUrl !== "" && (
            <div className="grid justify-items-center">
              <Image 
                src={state.thumbnailImageUrl} 
                alt="썸네일 미리보기" 
                width={256} 
                height={256} 
                className="object-cover rounded-lg"
              />
            </div>
          )}
          
          {state.thumbnailFeedback && (
            <div className={`text-center ${getFeedbackStyle(state.thumbnailFeedback)}`}>
              {state.thumbnailFeedback}
            </div>
          )}
          
          <FileInputButton 
            onChange={handlePhotosChange} 
            label="사진 선택" 
            multiple={true} 
          />
          {state.photosFeedback && (
            <div className={`text-center ${getFeedbackStyle(state.photosFeedback)}`}>
              {state.photosFeedback}
            </div>
          )}
          <textarea 
            name="description"
            placeholder="앨범 설명 (선택사항)"
            value={formData.description} 
            onChange={handleInputChange} 
            className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300"
            disabled={state.isSubmitting}
            rows={4}
          />
          <input 
            type="password" 
            name="password"
            placeholder="비밀번호 (선택사항)"
            value={formData.password} 
            onChange={handleInputChange} 
            className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300"
            disabled={state.isSubmitting}
          />
          {/* 공개/비공개 설정 */}
          <div className="flex items-center space-x-2">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={handleTogglePublic}
                className="sr-only peer"
                disabled={state.isSubmitting}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-stone-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {formData.isPublic ? '공개 앨범' : '비공개 앨범'}
              </span>
            </label>
          </div>
          <button
            type="submit"
            className="block w-full p-3 bg-stone-600 text-white rounded-lg hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={state.isSubmitting}
          >
            {state.isSubmitting ? '앨범 생성 중...' : '앨범 생성하기'}
          </button>
        </form>
      </div>
    </PasswordFormWrapper>
  );
};

export default UploadPage;
