import { NextResponse, type NextRequest } from "next/server";
import { connectToDB } from "@/utils/db";
import { Album } from "@/models";
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  // ObjectId 유효성 검사 추가
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid album id" }, { status: 404 });
  }

  try {
    await connectToDB();
    console.log("Connected to DB");

    const album = await Album.findOne({ _id: id }).exec();
    console.log("Albums fetched", album);

    if (!album) {
      return NextResponse.json({ message: "Album not found" }, { status: 404 });
    }

    // Transform the album data to match the frontend interface
    const transformedAlbum = {
      _id: album._id.toString(),
      title: album.title,
      description: album.description || '',
      date: album.date.toISOString(),
      thumbnailImage: album.thumbnailImage,
      photos: album.photos.map((photo: mongoose.Types.ObjectId) => photo.toString()),
      password: album.password || undefined,
      createdAt: album.createdAt.toISOString(),
      updatedAt: album.updatedAt ? album.updatedAt.toISOString() : album.createdAt.toISOString()
    };

    return NextResponse.json({ album: transformedAlbum }, { status: 200 });
  } catch (error) {
    console.error("Error fetching albums", error);
    return NextResponse.json({ message: "Error fetching albums", error }, { status: 500 });
  }
}