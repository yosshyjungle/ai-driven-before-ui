import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { createPostSchema } from "@/lib/validations";

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

    // URLパラメータからフィルター条件を取得
    const url = new URL(req.url);
    const tagFilter = url.searchParams.get('tag');
    const favoritesOnly = url.searchParams.get('favorites') === 'true';

    // クエリ条件を構築
    let whereCondition: any = { userId: userId };

    if (favoritesOnly) {
      // お気に入りのみの場合
      whereCondition = {
        favorites: {
          some: {
            userId: userId
          }
        }
      };
    }

    if (tagFilter) {
      // タグでフィルタリング
      whereCondition.postTags = {
        some: {
          tag: {
            name: tagFilter
          }
        }
      };
    }

    // 認証されたユーザーの投稿またはお気に入りを取得（ユーザー情報、タグ、お気に入り情報も含む）
    const posts = await prisma.post.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        },
        postTags: {
          include: {
            tag: true
          }
        },
        favorites: {
          where: {
            userId: userId
          }
        },
        _count: {
          select: {
            favorites: true
          }
        }
      },
      orderBy: { date: "desc" }
    });

    // お気に入り状態を含む形式に変換
    const postsWithFavorites = posts.map(post => ({
      ...post,
      isFavorited: post.favorites.length > 0,
      favoriteCount: post._count.favorites,
      tags: post.postTags.map(pt => pt.tag)
    }));

    console.log(`記事取得成功: ${posts.length}件 (ユーザー: ${userId})`);

    return NextResponse.json({ message: "Success", posts: postsWithFavorites }, { status: 200 });
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

    const body = await req.json();

    // Zodバリデーション
    const validationResult = createPostSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message).join(', ');
      return NextResponse.json({
        message: "Error",
        error: `バリデーションエラー: ${errors}`
      }, { status: 400 });
    }

    const { title, description, imageUrl, tags } = validationResult.data;

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

    // トランザクションで投稿とタグを作成
    const result = await prisma.$transaction(async (tx) => {
      // 投稿を作成
      const post = await tx.post.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          imageUrl: imageUrl || null,
          userId: userId
        }
      });

      // タグが指定されている場合はタグを作成・関連付け
      if (tags && Array.isArray(tags) && tags.length > 0) {
        for (const tagName of tags) {
          if (tagName.trim()) {
            // タグを作成または取得
            const tag = await tx.tag.upsert({
              where: { name: tagName.trim() },
              update: {},
              create: {
                name: tagName.trim(),
                color: "#3B82F6"
              }
            });

            // 投稿とタグを関連付け
            await tx.postTag.create({
              data: {
                postId: post.id,
                tagId: tag.id
              }
            });
          }
        }
      }

      return post;
    });

    console.log("記事作成成功:", result.id);

    return NextResponse.json({ message: "Success", post: result }, { status: 201 });
  } catch (err) {
    console.error("記事作成エラー:", err);
    return NextResponse.json({
      message: "Error",
      error: err instanceof Error ? err.message : "不明なエラー"
    }, { status: 500 });
  }
};