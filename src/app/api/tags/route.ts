import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// GET 全タグの取得
export const GET = async (req: Request) => {
    try {
        console.log("GET /api/tags - タグ取得開始");

        const tags = await prisma.tag.findMany({
            include: {
                _count: {
                    select: { postTags: true }
                }
            },
            orderBy: { name: "asc" }
        });

        console.log(`タグ取得成功: ${tags.length}件`);
        return NextResponse.json({ message: "Success", tags }, { status: 200 });
    } catch (err) {
        console.error("タグ取得エラー:", err);
        return NextResponse.json({
            message: "Error",
            error: err instanceof Error ? err.message : "不明なエラー"
        }, { status: 500 });
    }
};

// POST タグの作成
export const POST = async (req: Request) => {
    try {
        console.log("POST /api/tags - タグ作成開始");

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({
                message: "Error",
                error: "認証が必要です"
            }, { status: 401 });
        }

        const { name, color } = await req.json();

        if (!name) {
            return NextResponse.json({
                message: "Error",
                error: "タグ名は必須です"
            }, { status: 400 });
        }

        // 既存のタグ名かチェック
        const existingTag = await prisma.tag.findUnique({
            where: { name: name.trim() }
        });

        if (existingTag) {
            return NextResponse.json({ message: "Success", tag: existingTag }, { status: 200 });
        }

        const tag = await prisma.tag.create({
            data: {
                name: name.trim(),
                color: color || "#3B82F6"
            }
        });

        console.log(`タグ作成成功: ${tag.name}`);
        return NextResponse.json({ message: "Success", tag }, { status: 201 });
    } catch (err) {
        console.error("タグ作成エラー:", err);
        return NextResponse.json({
            message: "Error",
            error: err instanceof Error ? err.message : "不明なエラー"
        }, { status: 500 });
    }
}; 