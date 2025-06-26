import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// GET お気に入り一覧の取得
export const GET = async (req: Request) => {
    try {
        console.log("GET /api/favorites - お気に入り取得開始");

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({
                message: "Error",
                error: "認証が必要です"
            }, { status: 401 });
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: {
                post: {
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
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        console.log(`お気に入り取得成功: ${favorites.length}件`);
        return NextResponse.json({ message: "Success", favorites }, { status: 200 });
    } catch (err) {
        console.error("お気に入り取得エラー:", err);
        return NextResponse.json({
            message: "Error",
            error: err instanceof Error ? err.message : "不明なエラー"
        }, { status: 500 });
    }
};

// POST お気に入りの追加
export const POST = async (req: Request) => {
    try {
        console.log("POST /api/favorites - お気に入り追加開始");

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({
                message: "Error",
                error: "認証が必要です"
            }, { status: 401 });
        }

        const { postId } = await req.json();

        if (!postId) {
            return NextResponse.json({
                message: "Error",
                error: "投稿IDは必須です"
            }, { status: 400 });
        }

        // 投稿が存在するかチェック
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return NextResponse.json({
                message: "Error",
                error: "投稿が見つかりません"
            }, { status: 404 });
        }

        // 既にお気に入りに追加済みかチェック
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        if (existingFavorite) {
            return NextResponse.json({
                message: "Error",
                error: "既にお気に入りに追加済みです"
            }, { status: 409 });
        }

        const favorite = await prisma.favorite.create({
            data: {
                userId,
                postId
            }
        });

        console.log(`お気に入り追加成功: ユーザー${userId}, 投稿${postId}`);
        return NextResponse.json({ message: "Success", favorite }, { status: 201 });
    } catch (err) {
        console.error("お気に入り追加エラー:", err);
        return NextResponse.json({
            message: "Error",
            error: err instanceof Error ? err.message : "不明なエラー"
        }, { status: 500 });
    }
};

// DELETE お気に入りの削除
export const DELETE = async (req: Request) => {
    try {
        console.log("DELETE /api/favorites - お気に入り削除開始");

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({
                message: "Error",
                error: "認証が必要です"
            }, { status: 401 });
        }

        const { postId } = await req.json();

        if (!postId) {
            return NextResponse.json({
                message: "Error",
                error: "投稿IDは必須です"
            }, { status: 400 });
        }

        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        if (!favorite) {
            return NextResponse.json({
                message: "Error",
                error: "お気に入りが見つかりません"
            }, { status: 404 });
        }

        await prisma.favorite.delete({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        console.log(`お気に入り削除成功: ユーザー${userId}, 投稿${postId}`);
        return NextResponse.json({ message: "Success" }, { status: 200 });
    } catch (err) {
        console.error("お気に入り削除エラー:", err);
        return NextResponse.json({
            message: "Error",
            error: err instanceof Error ? err.message : "不明なエラー"
        }, { status: 500 });
    }
}; 