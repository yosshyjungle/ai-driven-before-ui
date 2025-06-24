import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";

// 環境変数を動的に設定
process.env.DATABASE_URL = "postgresql://postgres.temqtgwwkiouxakgbupi:YosshyRei0709@aws-0-us-east-2.pooler.supabase.com:5432/postgres";

// Prismaクライアントのシングルトンインスタンス
const prisma = new PrismaClient();

// GET ブログの全記事取得
export const GET = async (req: Request, res: NextResponse) => {
  try {
    console.log("GET /api/blog - 記事取得開始");

    const posts = await prisma.post.findMany({
      orderBy: { date: "desc" }
    });
    console.log(`記事取得成功: ${posts.length}件`);

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
export const POST = async (req: Request, res: NextResponse) => {
  try {
    console.log("POST /api/blog - 記事作成開始");
    const { title, description } = await req.json();

    if (!title || !description) {
      return NextResponse.json({
        message: "Error",
        error: "タイトルと内容は必須です"
      }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        description: description.trim()
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