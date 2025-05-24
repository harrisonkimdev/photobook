import { Schema, model, models } from "mongoose";
import { IAlbum, IPhoto } from "@/interfaces";

// 이미지 스키마 (내장 문서)
const imageSchema = new Schema(
  {
    public_id: { type: String, required: true },
    url: { type: String, required: true }
  },
  { _id: false }
);

// 앨범 스키마
const albumSchema = new Schema<IAlbum>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    password: {
      type: String,
      required: false
    },
    accessUrl: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    thumbnail: {
      type: imageSchema,
      required: true
    },
    photos: {
      type: [imageSchema],
      default: []
    },
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// 사진 스키마 (필요시 사용)
const photoSchema = new Schema<IPhoto>(
  {
    albumId: {
      type: Schema.Types.ObjectId,
      ref: 'Album',
      required: true,
      index: true
    },
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      required: false
    },
    height: {
      type: Number,
      required: false
    },
    format: {
      type: String,
      required: true
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// 인덱스 추가
albumSchema.index({ accessUrl: 1 });
photoSchema.index({ albumId: 1, createdAt: -1 });

// 모델 내보내기
export const Album = models.Album || model<IAlbum>('Album', albumSchema);
export const Photo = models.Photo || model<IPhoto>('Photo', photoSchema);