import { NextResponse } from "next/server";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { v4 as uuidv4 } from 'uuid';
import { Album } from '@/models';
import type { IAlbum } from '@/interfaces';

export async function GET() {
  try {
    console.log('GET /api/albums - Starting request');
    
    // Find all public albums or albums with access URL
    const albums = await Album.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .lean() as IAlbum[];
      
    console.log('Albums from DB:', JSON.stringify(albums, null, 2));
    
    // Transform the data for the frontend
    const responseData = albums.map(album => ({
      id: album._id.toString(),
      title: album.title,
      description: album.description || '',
      thumbnail: album.thumbnail,
      accessUrl: album.accessUrl,
      isPublic: album.isPublic,
      photoCount: album.photos?.length || 0,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt
    }));

    return NextResponse.json({ albums: responseData });
  } catch (error) {
    console.error("Error fetching albums:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const thumbnailFile = formData.get("thumbnail") as File;
    const photoFiles = formData.getAll("photos") as File[];
    const password = formData.get("password") as string;

    if (!title || !thumbnailFile || photoFiles.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert File to Buffer for Cloudinary upload
    const thumbnailBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
    const photoBuffers = await Promise.all(
      photoFiles.map((file) => file.arrayBuffer().then(Buffer.from))
    );

    // Upload thumbnail to Cloudinary
    const thumbnailResult = await uploadImageToCloudinary(thumbnailBuffer, {
      folder: "photobook-9mo4",
      resource_type: "image",
    });

    // Upload photos to Cloudinary
    const photoResults = await Promise.all(
      photoBuffers.map((buffer) =>
        uploadImageToCloudinary(buffer, {
          folder: "photobook-9mo4",
          resource_type: "image",
        })
      )
    );

    // Create a unique access URL
    const accessUrl = uuidv4();

    // Create album in database
    const album = new Album({
      title,
      description: description || '',
      accessUrl,
      thumbnail: {
        public_id: thumbnailResult.public_id,
        url: thumbnailResult.secure_url,
      },
      photos: photoResults.map((result, index) => ({
        public_id: result.public_id,
        url: result.secure_url,
        filename: photoFiles[index].name,
        size: photoFiles[index].size,
        format: result.format,
        width: result.width,
        height: result.height
      })),
      password: password || undefined,
      isPublic: false // Default to private
    });

    await album.save();

    // Prepare response data
    const responseData = {
      id: album._id,
      title: album.title,
      description: album.description,
      accessUrl: album.accessUrl,
      thumbnail: album.thumbnail,
      photos: album.photos,
      isPublic: album.isPublic,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error creating album:", error);
    return NextResponse.json(
      { error: "Failed to create album" },
      { status: 500 }
    );
  }
}