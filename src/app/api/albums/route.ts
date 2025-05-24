import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function GET() {
  try {
    console.log('GET /api/albums - Starting request');
    const { db } = await connectToDatabase();
    console.log('Connected to database');
    
    const albums = await db.collection("albums").find({}).toArray();
    console.log('Raw albums from DB:', JSON.stringify(albums, null, 2));
    
    // Transform the data structure to match the frontend interface
    const transformedAlbums = albums.map(album => {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
      const createdAt = new Date(album.createdAt);
      const updatedAt = album.updatedAt ? new Date(album.updatedAt) : createdAt;
      
      return {
        _id: album._id.toString(),
        title: album.title,
        description: album.description || '',
        date: createdAt.toISOString(),
        thumbnailImage: album.thumbnail?.public_id ? {
          public_id: album.thumbnail.public_id,
          url: `${baseUrl}/${album.thumbnail.public_id}`
        } : null,
        photos: (album.photos || []).map((photo: { public_id: string }) => ({
          public_id: photo.public_id,
          url: `${baseUrl}/${photo.public_id}`
        })),
        password: album.password || undefined,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString()
      };
    });

    console.log('Final transformed albums:', JSON.stringify(transformedAlbums, null, 2));
    return NextResponse.json({ albums: transformedAlbums });
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

    const { db } = await connectToDatabase();
    const album = {
      title,
      description: description || '',
      thumbnail: {
        public_id: thumbnailResult.public_id,
        url: thumbnailResult.secure_url,
      },
      photos: photoResults.map((result) => ({
        public_id: result.public_id,
        url: result.secure_url,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      password: password || undefined
    };

    const result = await db.collection("albums").insertOne(album);
    const createdAlbum = {
      _id: result.insertedId.toString(),
      title: album.title,
      description: album.description,
      date: album.createdAt.toISOString(),
      thumbnailImage: album.thumbnail.public_id,
      photos: album.photos.map(photo => photo.public_id),
      password: album.password,
      createdAt: album.createdAt.toISOString(),
      updatedAt: album.updatedAt.toISOString()
    };
    return NextResponse.json({ album: createdAlbum });
  } catch (error) {
    console.error("Error creating album:", error);
    return NextResponse.json(
      { error: "Failed to create album" },
      { status: 500 }
    );
  }
}