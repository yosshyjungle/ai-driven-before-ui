import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET 全タグの取得（認証不要・閲覧専用）
export const GET = async (_req: Request) => {
    try {
        console.log("GET /api/public/tags - 公開タグ取得開始");

        const tags = await prisma.tag.findMany({
            include: {
                _count: {
                    select: { postTags: true }
                }
            },
            orderBy: { name: "asc" }
        });

        console.log(`公開タグ取得成功: ${tags.length}件`);
        return NextResponse.json({ message: "Success", tags }, { status: 200 });
    } catch (err) {
        console.error("公開タグ取得エラー:", err);
        return NextResponse.json({
            message: "Error",
            error: err instanceof Error ? err.message : "不明なエラー"
        }, { status: 500 });
    }
}; 