import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("POST request received");

  try {
    const searchParams = req.nextUrl.searchParams;
    const { pwdInput, albumId } = await req.json();
    const albumPassword = searchParams.get("albumPassword") === "true";

    console.log("Request body:", { pwdInput, albumId });
    console.log("Album password from search params:", albumPassword);

    if (albumPassword) {
      try {
        console.log("Connecting to database...");
        const { db } = await connectToDatabase();
        console.log("Connected to database");

        console.log("Finding album with ID:", albumId);
        let album;
        try {
          album = await db.collection("albums").findOne({ _id: new ObjectId(albumId) });
        } catch (error) {
          console.error("Error finding album:", error);
          return NextResponse.json(
            { 
              success: false, 
              message: "Invalid album ID format", 
              error: error instanceof Error ? error.message : String(error) 
            }, 
            { status: 400 }
          );
        }
        
        console.log("Album found:", album);

        if (!album) {
          console.log("Album not found");
          return NextResponse.json({ success: false, message: "Album not found" }, { status: 404 });
        }

        const hashedPassword = album.password;
        console.log("Stored hashed password:", hashedPassword);
        console.log("Input password:", pwdInput);
        
        console.log("Comparing passwords...");
        const match = await bcrypt.compare(pwdInput, hashedPassword);

        console.log("Password match result:", match);

        if (match) {
          return NextResponse.json({ success: true }, { status: 200 });
        } else {
          return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 });
        }
      } catch (error) {
        console.error("Error verifying album password", error);
        return NextResponse.json(
          { 
            success: false, 
            message: "Error verifying password", 
            error: error instanceof Error ? error.message : String(error) 
          }, 
          { status: 500 }
        );
      }
    } else {
      console.log("No album password provided, checking admin password");

      if (pwdInput === process.env.ADMIN_PASSWORD) {
        console.log("Admin password match");
        return NextResponse.json({ success: true }, { status: 200 });
      } else {
        console.log("Admin password mismatch");
        return NextResponse.json({ success: false, message: "Invalid admin password" }, { status: 401 });
      }
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Error processing request", 
        error: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
}