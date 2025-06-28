import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { updatePostSchema, idParamSchema } from "@/lib/validations";

// Prismaクライアントのシングルトンインスタンス
const prisma = new PrismaClient();

// GET ブログの記事ひとつを取得（認証されたユーザーの投稿のみ）
export const GET = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id: idString } = await params;
    console.log(`GET /api/blog/${idString} - 記事取得開始`);

    // IDバリデーション
    const idValidation = idParamSchema.safeParse({ id: idString });
    if (!idValidation.success) {
      return NextResponse.json({
        message: "Error",
        error: "無効なIDです"
      }, { status: 400 });
    }

    const id = idValidation.data.id;

    // ユーザー認証情報を取得
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        message: "Error",
        error: "認証が必要です"
      }, { status: 401 });
    }

    // 認証されたユーザーの投稿のみを取得
    const post = await prisma.post.findFirst({
      where: {
        id: id,
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    console.log(`記事取得成功: ${post.title} (ユーザー: ${userId})`);
    return NextResponse.json({ message: "Success", post }, { status: 200 });
  } catch (err) {
    console.error("記事取得エラー:", err);
    return NextResponse.json({
      message: "Error",
      error: err instanceof Error ? err.message : "不明なエラー"
    }, { status: 500 });
  }
};

// PUT ブログの記事を更新
export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id: idString } = await params;
    console.log(`PUT /api/blog/${idString} - 記事更新開始`);

    // IDバリデーション
    const idValidation = idParamSchema.safeParse({ id: idString });
    if (!idValidation.success) {
      return NextResponse.json({
        message: "Error",
        error: "無効なIDです"
      }, { status: 400 });
    }

    const id = idValidation.data.id;

    const body = await req.json();

    // リクエストボディのバリデーション
    const validationResult = updatePostSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message).join(', ');
      return NextResponse.json({
        message: "Error",
        error: `バリデーションエラー: ${errors}`
      }, { status: 400 });
    }

    const { title, description, imageUrl } = validationResult.data;

    // ユーザー認証情報を取得
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        message: "Error",
        error: "認証が必要です"
      }, { status: 401 });
    }

    // 記事の所有者確認
    const existingPost = await prisma.post.findFirst({
      where: { id }
    });

    if (!existingPost) {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    // 記事の作成者でない場合は編集を禁止
    if (existingPost.userId && existingPost.userId !== userId) {
      return NextResponse.json({
        message: "Error",
        error: "この記事を編集する権限がありません"
      }, { status: 403 });
    }

    const post = await prisma.post.update({
      data: {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl || null
      },
      where: { id },
    });

    console.log(`記事更新成功: ${post.title}`);
    return NextResponse.json({ message: "Success", post }, { status: 200 });
  } catch (err) {
    console.error("記事更新エラー:", err);
    return NextResponse.json({
      message: "Error",
      error: err instanceof Error ? err.message : "不明なエラー"
    }, { status: 500 });
  }
};

// DELETE ブログの記事を削除
export const DELETE = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id: idString } = await params;
    console.log(`DELETE /api/blog/${idString} - 記事削除開始`);

    // IDバリデーション
    const idValidation = idParamSchema.safeParse({ id: idString });
    if (!idValidation.success) {
      return NextResponse.json({
        message: "Error",
        error: "無効なIDです"
      }, { status: 400 });
    }

    const id = idValidation.data.id;

    // ユーザー認証情報を取得
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        message: "Error",
        error: "認証が必要です"
      }, { status: 401 });
    }

    // 記事の所有者確認
    const existingPost = await prisma.post.findFirst({
      where: { id }
    });

    if (!existingPost) {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    // 記事の作成者でない場合は削除を禁止
    if (existingPost.userId && existingPost.userId !== userId) {
      return NextResponse.json({
        message: "Error",
        error: "この記事を削除する権限がありません"
      }, { status: 403 });
    }

    const post = await prisma.post.delete({
      where: { id },
    });

    console.log(`記事削除成功: ${post.title}`);
    return NextResponse.json({ message: "Success", post }, { status: 200 });
  } catch (err) {
    console.error("記事削除エラー:", err);
    return NextResponse.json({
      message: "Error",
      error: err instanceof Error ? err.message : "不明なエラー"
    }, { status: 500 });
  }
};