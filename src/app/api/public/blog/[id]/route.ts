import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { idParamSchema } from "@/lib/validations";

// Prismaクライアントのシングルトンインスタンス
const prisma = new PrismaClient();

// GET ブログの記事ひとつを取得（認証不要・閲覧専用）
export const GET = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const { id: idString } = await params;
        console.log(`GET /api/public/blog/${idString} - 公開記事詳細取得開始`);

        // IDバリデーション
        const idValidation = idParamSchema.safeParse({ id: idString });
        if (!idValidation.success) {
            return NextResponse.json({
                message: "Error",
                error: "無効なIDです"
            }, { status: 400 });
        }

        const id = idValidation.data.id;

        // 認証不要で記事を取得
        const post = await prisma.post.findUnique({
            where: {
                id: id
            },
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
            }
        });

        if (!post) {
            return NextResponse.json({ message: "Not Found" }, { status: 404 });
        }

        // レスポンス用のデータを整形
        const formattedPost = {
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
        };

        console.log(`公開記事詳細取得成功: ${post.title}`);
        return NextResponse.json({ message: "Success", post: formattedPost }, { status: 200 });
    } catch (err) {
        console.error("公開記事詳細取得エラー:", err);
        return NextResponse.json({
            message: "Error",
            error: err instanceof Error ? err.message : "不明なエラー"
        }, { status: 500 });
    }
}; 