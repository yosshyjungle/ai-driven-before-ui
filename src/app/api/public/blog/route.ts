import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Prismaクライアントのシングルトンインスタンス
const prisma = new PrismaClient();

// GET 全ユーザーのブログ記事を取得（認証不要・閲覧専用）
export const GET = async (req: Request) => {
    try {
        console.log("GET /api/public/blog - 公開記事取得開始");

        // URLパラメータからフィルター条件を取得
        const url = new URL(req.url);
        const tagFilter = url.searchParams.get('tag');

        // クエリ条件を構築（認証不要なのでuserIdフィルターなし）
        const whereCondition: { postTags?: { some: { tag: { name: string } } } } = {};

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

        // 全ユーザーの公開投稿を取得（ユーザー情報、タグ、お気に入り数も含む）
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
                _count: {
                    select: {
                        favorites: true
                    }
                }
            },
            orderBy: { date: "desc" }
        });

        // レスポンス用のデータを整形（認証関連の情報を除去）
        const formattedPosts = posts.map(post => ({
            id: post.id,
            title: post.title,
            description: post.description,
            date: post.date,
            imageUrl: post.imageUrl,
            user: post.user,
            tags: post.postTags.map(pt => pt.tag),
            favoriteCount: post._count.favorites,
            // お気に入り状態は認証不要なので含めない
            isFavorited: false
        }));

        console.log(`公開記事取得成功: ${formattedPosts.length}件`);
        return NextResponse.json({ message: "Success", posts: formattedPosts }, { status: 200 });
    } catch (err) {
        console.error("公開記事取得エラー:", err);
        return NextResponse.json({
            message: "Error",
            error: err instanceof Error ? err.message : "不明なエラー"
        }, { status: 500 });
    }
}; 