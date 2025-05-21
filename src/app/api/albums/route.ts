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
    
    // If no albums exist, create a test album
    if (albums.length === 0) {
      console.log('No albums found, creating test album...');
      const testAlbum = {
        title: "Test Album",
        description: "This is a test album",
        thumbnail: {
          public_id: "photobook-9mo4/i0mplqvn8dx5zjn3emj0",
          url: "https://res.cloudinary.com/de6ndbmhd/image/upload/photobook-9mo4/i0mplqvn8dx5zjn3emj0.jpg"
        },
        photos: [{
          public_id: "photobook-9mo4/i0mplqvn8dx5zjn3emj0",
          url: "https://res.cloudinary.com/de6ndbmhd/image/upload/photobook-9mo4/i0mplqvn8dx5zjn3emj0.jpg"
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection("albums").insertOne(testAlbum);
      console.log('Test album created:', result);
      
      // Fetch the newly created album
      const newAlbums = await db.collection("albums").find({}).toArray();
      albums.push(...newAlbums);
    }

    // Transform the data structure to match the frontend interface
    const transformedAlbums = albums.map(album => ({
      _id: album._id.toString(),
      title: album.title,
      description: album.description || '',
      date: album.createdAt.toISOString(),
      thumbnailImage: album.thumbnail.public_id,
      photos: album.photos.map((photo: { public_id: string }) => photo.public_id),
      password: album.password || undefined,
      createdAt: album.createdAt.toISOString(),
      updatedAt: album.updatedAt ? album.updatedAt.toISOString() : album.createdAt.toISOString()
    }));

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