import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

// Prismaクライアントのシングルトンインスタンス
const prisma = new PrismaClient();

// GET ブログの全記事取得（認証されたユーザーの投稿のみ）
export const GET = async (req: Request) => {
  try {
    console.log("GET /api/blog - 記事取得開始");

    // ユーザー認証情報を取得
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        message: "Error",
        error: "認証が必要です"
      }, { status: 401 });
    }

    // 認証されたユーザーの投稿のみを取得（ユーザー情報も含む）
    const posts = await prisma.post.findMany({
      where: { userId: userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        }
      },
      orderBy: { date: "desc" }
    });
    console.log(`記事取得成功: ${posts.length}件 (ユーザー: ${userId})`);

    return NextResponse.json({ message: "Success", posts }, { status: 200 });
  } catch (err) {
    console.error("記事取得エラー:", err);
    return NextResponse.json({
      message: "Error",
      error: err instanceof Error ? err.message : "不明なエラー"
    }, { status: 500 });
  }
};

// POST ブログの記事作成
export const POST = async (req: Request) => {
  try {
    console.log("POST /api/blog - 記事作成開始");

    // ユーザー認証情報を取得
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        message: "Error",
        error: "認証が必要です"
      }, { status: 401 });
    }

    const { title, description } = await req.json();

    if (!title || !description) {
      return NextResponse.json({
        message: "Error",
        error: "タイトルと内容は必須です"
      }, { status: 400 });
    }

    // ユーザーが存在するかチェックし、存在しない場合はユーザーを作成
    try {
      await prisma.user.findUniqueOrThrow({
        where: { id: userId }
      });
    } catch (userNotFoundError) {
      console.log(`ユーザー ${userId} がデータベースに存在しません。同期処理をトリガーします。`);
      return NextResponse.json({
        message: "Error",
        error: "ユーザー情報の同期が必要です。もう一度お試しください。"
      }, { status: 409 });
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        userId: userId // 必須のユーザーID
      }
    });
    console.log("記事作成成功:", post.id);

    return NextResponse.json({ message: "Success", post }, { status: 201 });
  } catch (err) {
    console.error("記事作成エラー:", err);
    return NextResponse.json({
      message: "Error",
      error: err instanceof Error ? err.message : "不明なエラー"
    }, { status: 500 });
  }
};