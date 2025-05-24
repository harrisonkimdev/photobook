export interface ICloudinaryImage {
  public_id: string;
  url: string;
}

export interface IAlbum {
  _id: string;
  title: string;
  date: string;
  thumbnailImage: ICloudinaryImage | null;
  photos: ICloudinaryImage[];
  password?: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
}