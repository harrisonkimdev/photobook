import { NextResponse, type NextRequest } from "next/server";
import { Album } from "@/models";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { IAlbum } from "@/interfaces";

/**
 * 앨범 상세 조회 API
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const accessUrl = req.nextUrl.searchParams.get("accessUrl");

  // ObjectId 유효성 검사
  if (!mongoose.Types.ObjectId.isValid(id) && !accessUrl) {
    return NextResponse.json(
      { message: "유효하지 않은 앨범 ID입니다" },
      { status: 400 }
    );
  }

  try {
    // 쿠키에서 인증 정보 확인
    const cookieStore = cookies();
    const authCookie = cookieStore.get(`album_auth_${id}`);
    const isAuthenticated = !!authCookie?.value;

    // 조회 조건 설정
    const query = accessUrl
      ? { accessUrl } // accessUrl로 조회
      : { _id: id }; // ID로 조회

    // 앨범 조회
    const album = await Album.findOne(query).lean() as unknown as IAlbum;
    
    // 타입 안전성을 위한 타입 가드
    if (!album || Array.isArray(album)) {
      return NextResponse.json(
        { message: "앨범을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    if (!album) {
      return NextResponse.json(
        { message: "앨범을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 비공개 앨범이고 인증되지 않은 경우 제한된 정보만 반환
    if (!album.isPublic && !isAuthenticated && !accessUrl) {
      return NextResponse.json({
        album: {
          _id: album._id.toString(),
          title: album.title,
          description: album.description || "",
          thumbnail: album.thumbnail,
          isProtected: !!album.password,
          isPublic: album.isPublic,
          createdAt: album.createdAt,
        },
        requiresPassword: true,
      });
    }

    // 전체 앨범 정보 반환
    const responseData = {
      _id: album._id.toString(),
      title: album.title,
      description: album.description || "",
      thumbnail: album.thumbnail,
      photos: album.photos,
      accessUrl: album.accessUrl,
      isPublic: album.isPublic,
      isProtected: !!album.password,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
    };

    return NextResponse.json({
      album: responseData,
      requiresPassword: false,
    });
  } catch (error) {
    console.error("앨범 조회 오류:", error);
    return NextResponse.json(
      { message: "앨범 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

/**
 * 앨범 비밀번호 인증 API
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  // ObjectId 유효성 검사
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "유효하지 않은 앨범 ID입니다" },
      { status: 400 }
    );
  }

  try {
    // 요청 본문에서 비밀번호 추출
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { message: "비밀번호가 필요합니다" },
        { status: 400 }
      );
    }

    // 앨범 조회
    const album = await Album.findById(id).select("+password").lean() as unknown as IAlbum;

    if (!album) {
      return NextResponse.json(
        { message: "앨범을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 비밀번호가 없는 앨범인 경우
    if (!album.password) {
      // 쿠키 설정
      const response = NextResponse.json(
        { message: "이 앨범은 비밀번호가 필요하지 않습니다", isValid: true },
        { status: 200 }
      );
      response.cookies.set(`album_auth_${id}`, "true", {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7일
        path: "/",
      });
      return response;
    }

    // 비밀번호 검증
    const isValid = album.password === password;

    if (!isValid) {
      return NextResponse.json(
        { message: "잘못된 비밀번호입니다", isValid: false },
        { status: 401 }
      );
    }

    // 성공 응답 및 쿠키 설정
    const response = NextResponse.json(
      { message: "비밀번호가 확인되었습니다", isValid: true },
      { status: 200 }
    );
    response.cookies.set(`album_auth_${id}`, "true", {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("비밀번호 검증 오류:", error);
    return NextResponse.json(
      { message: "비밀번호 검증 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}