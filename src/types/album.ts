export interface IAlbum {
  _id: string;
  title: string;
  date: string;
  thumbnailImage: string;  // This will be the Cloudinary public_id
  photos: string[];        // These will be Cloudinary public_ids
  password?: string;
  createdAt: string;
  updatedAt: string;
  description?: string;    // Adding optional description field
} 