import { NextResponse, type NextRequest } from "next/server";
import { Album } from "@/models";
import mongoose from "mongoose";

/**
 * 앨범 비밀번호 검증 API
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const album = await Album.findById(id).select("+password").lean();
    
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

    // 비밀번호가 없는 앨범인 경우
    if (!album.password) {
      return NextResponse.json(
        { message: "이 앨범은 비밀번호가 필요하지 않습니다", isValid: true },
        { status: 200 }
      );
    }

    // 비밀번호 검증
    const isValid = album.password === password;

    if (!isValid) {
      return NextResponse.json(
        { message: "잘못된 비밀번호입니다", isValid: false },
        { status: 401 }
      );
    }

    // 성공 응답
    return NextResponse.json(
      { message: "비밀번호가 확인되었습니다", isValid: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("비밀번호 검증 오류:", error);
    return NextResponse.json(
      { message: "비밀번호 검증 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
