import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { syncUserSchema } from "@/lib/validations";

const prisma = new PrismaClient();

export const POST = async (req: Request) => {
    try {
        console.log("POST /api/sync-user - ユーザー同期開始");

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
        const validationResult = syncUserSchema.safeParse(body);

        if (!validationResult.success) {
            const errors = validationResult.error.errors.map(err => err.message).join(', ');
            return NextResponse.json({
                message: "Error",
                error: `バリデーションエラー: ${errors}`
            }, { status: 400 });
        }

        const { id, email, firstName, lastName, imageUrl } = validationResult.data;

        // 認証されたユーザーIDとリクエストのIDが一致するかチェック
        if (userId !== id) {
            return NextResponse.json({
                message: "Error",
                error: "権限がありません"
            }, { status: 403 });
        }

        // ユーザーが存在する場合は更新、存在しない場合は作成
        const user = await prisma.user.upsert({
            where: { id },
            update: {
                email,
                firstName: firstName || null,
                lastName: lastName || null,
                imageUrl: imageUrl || null,
            },
            create: {
                id,
                email,
                firstName: firstName || null,
                lastName: lastName || null,
                imageUrl: imageUrl || null,
            },
        });

        console.log("ユーザー同期成功:", user.id);

        return NextResponse.json({ message: "Success", user }, { status: 200 });
    } catch (err) {
        console.error("ユーザー同期エラー:", err);
        return NextResponse.json({
            message: "Error",
            error: err instanceof Error ? err.message : "不明なエラー"
        }, { status: 500 });
    }
}; 