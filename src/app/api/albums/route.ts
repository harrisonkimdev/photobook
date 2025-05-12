import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const album = await db.collection("albums").findOne({});
    console.log("DB에서 조회된 앨범 데이터:", album);
    return NextResponse.json({ albums: album ? [album] : [] });
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
      description,
      thumbnail: {
        public_id: thumbnailResult.public_id,
        url: thumbnailResult.secure_url,
      },
      photos: photoResults.map((result) => ({
        public_id: result.public_id,
        url: result.secure_url,
      })),
      createdAt: new Date(),
    };

    const result = await db.collection("albums").insertOne(album);
    return NextResponse.json({ album: { ...album, _id: result.insertedId } });
  } catch (error) {
    console.error("Error creating album:", error);
    return NextResponse.json(
      { error: "Failed to create album" },
      { status: 500 }
    );
  }
}