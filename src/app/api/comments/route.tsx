import { NextResponse, type NextRequest } from "next/server";
import { connectToDB } from "@/utils/db";
import { Comment, Photo } from "@/models";
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const photoId = searchParams.get("photoId");
  const type = searchParams.get("type"); // 'all' | 'original-requests'

  if (!photoId) {
    return NextResponse.json({ message: "photoId is required" }, { status: 400 });
  }

  try {
    await connectToDB();
    console.log("Connected to DB");

    let comments;
    if (type === 'original-requests') {
      comments = await Comment.find({ 
        photoId, 
        isOriginalRequest: true,
        originalRequestStatus: 'pending'
      }).sort({ createdAt: -1 });
    } else {
      comments = await Comment.find({ photoId }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { message: "Error fetching comments", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const photoId = searchParams.get("photoId");
  
  const { username, text, password, isOriginalRequest, replyTo } = await req.json();
  
  if (!photoId || !username || !text || !password) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    await connectToDB();
    console.log("Connected to DB");

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return NextResponse.json({ message: "Photo not found" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newComment = new Comment({
      photoId,
      username,
      text,
      password: hashedPassword,
      vote: 0,
      isOriginalRequest: isOriginalRequest || false,
      originalRequestStatus: isOriginalRequest ? 'pending' : undefined,
      replyTo,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const createdComment = await newComment.save();
    console.log("New comment created:", createdComment);

    return NextResponse.json({ createdComment }, { status: 201 });
  } catch (error) {
    console.error("Error adding a comment:", error);
    return NextResponse.json(
      { message: "Error adding a comment", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const commentId = searchParams.get("commentId");
  
  if (!commentId) {
    return NextResponse.json(
      { message: "commentId is required" },
      { status: 400 }
    );
  }

  const { status } = await req.json();

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return NextResponse.json(
      { message: "Invalid status" },
      { status: 400 }
    );
  }

  try {
    await connectToDB();
    console.log("Connected to DB");

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ message: "Comment not found" }, { status: 404 });
    }

    if (!comment.isOriginalRequest) {
      return NextResponse.json(
        { message: "This comment is not an original request" },
        { status: 400 }
      );
    }

    await comment.updateOriginalRequestStatus(status);

    return NextResponse.json(
      { message: "Comment status updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating comment status:", error);
    return NextResponse.json(
      { message: "Error updating comment status", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}