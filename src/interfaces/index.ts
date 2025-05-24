import { Document, Types } from "mongoose"

export interface IImage {
  public_id: string
  url: string
}

export interface IAlbum extends Document {
  title: string
  description: string
  password?: string
  thumbnail: IImage
  photos: IImage[]
  accessUrl: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IPhoto extends Document {
  albumId: Types.ObjectId
  public_id: string
  url: string
  filename: string
  size: number
  width?: number
  height?: number
  format: string
  createdAt: Date
}