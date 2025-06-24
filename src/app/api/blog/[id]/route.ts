import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";

// 環境変数を動的に設定
process.env.DATABASE_URL = "postgresql://postgres.temqtgwwkiouxakgbupi:YosshyRei0709@aws-0-us-east-2.pooler.supabase.com:5432/postgres";

// Prismaクライアントのシングルトンインスタンス
const prisma = new PrismaClient();

// GET ブログの記事ひとつを取得
export const GET = async (req: Request, res: NextResponse) => {
  try {
    const id: number = parseInt(req.url.split("/blog/")[1]);
    console.log(`GET /api/blog/${id} - 記事取得開始`);

    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const post = await prisma.post.findFirst({ where: { id } });

    if (!post) {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    console.log(`記事取得成功: ${post.title}`);
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
export const PUT = async (req: Request, res: NextResponse) => {
  try {
    const id: number = parseInt(req.url.split("/blog/")[1]);
    const { title, description } = await req.json();
    console.log(`PUT /api/blog/${id} - 記事更新開始`);

    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    if (!title || !description) {
      return NextResponse.json({
        message: "Error",
        error: "タイトルと内容は必須です"
      }, { status: 400 });
    }

    const post = await prisma.post.update({
      data: {
        title: title.trim(),
        description: description.trim()
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
export const DELETE = async (req: Request, res: NextResponse) => {
  try {
    const id: number = parseInt(req.url.split("/blog/")[1]);
    console.log(`DELETE /api/blog/${id} - 記事削除開始`);

    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
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