# AI Driven Blog Platform

このプロジェクトは、AI技術を活用したブログプラットフォームです。ユーザーは記事の投稿、お気に入り機能、タグによるフィルタリング、画像の投稿が可能です。

## 新機能

### 🎯 お気に入り機能
- 記事をお気に入りに追加・削除
- お気に入り記事のみの表示
- お気に入り専用ページ

### 🏷️ タグ・フィルター機能
- 記事にタグを追加
- タグによる記事のフィルタリング
- タグごとの記事数表示

### 📸 画像投稿機能
- Supabase Storageを使用した画像アップロード
- 画像プレビュー機能
- ファイルサイズ・形式制限（5MB以下、JPEG/PNG）

## 技術スタック

- **フロントエンド**: Next.js 15.3.4, React 19, TypeScript
- **認証**: Clerk
- **データベース**: PostgreSQL + Prisma
- **ストレージ**: Supabase Storage
- **スタイリング**: Tailwind CSS

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Database
DATABASE_URL="your_postgresql_database_url"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
CLERK_WEBHOOK_SECRET="your_clerk_webhook_secret"

# Supabase (画像アップロード用)
NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

### 3. Supabase Storage設定

#### 3.1 プロジェクトとバケットの作成
1. [Supabase](https://supabase.com)でアカウントを作成
2. 新しいプロジェクトを作成
3. Storage > Bucketsで`images`バケットを作成（**重要**: バケット名は`images`である必要があります）
4. バケットを**Public**に設定

#### 3.2 ポリシーの設定
Storage > Policies で以下のポリシーを設定してください：

**🔍 SELECT（読み取り）ポリシー**:
- Policy name: `Allow anonymous read access`
- Allowed operation: `SELECT`
- Target roles: `anon`
- USING expression:
```sql
bucket_id = 'images'
```

**📤 INSERT（アップロード）ポリシー**:
- Policy name: `Allow anonymous uploads`
- Allowed operation: `INSERT`
- Target roles: `anon`
- WITH CHECK expression:
```sql
bucket_id = 'images'
```

**✏️ UPDATE（更新）ポリシー**:
- Policy name: `Allow anonymous updates`
- Allowed operation: `UPDATE`
- Target roles: `anon`
- USING expression:
```sql
bucket_id = 'images'
```

**🗑️ DELETE（削除）ポリシー**:
- Policy name: `Allow anonymous deletes`
- Allowed operation: `DELETE`
- Target roles: `anon`
- USING expression:
```sql
bucket_id = 'images'
```

#### 3.3 環境変数の取得
1. Settings > API でプロジェクトURLとAnon Keyを取得
2. `.env.local`ファイルに設定:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

#### 3.4 設定確認
正しく設定されていれば、以下のような構成になります：
- バケット名: `images`
- バケットの可視性: Public
- ポリシー: 匿名ユーザー（anon）による読み取り・書き込み・更新・削除が許可

### 4. データベースのセットアップ
```bash
npx prisma migrate dev
npx prisma generate
```

### 5. 開発サーバーの起動
```bash
npm run dev
```

## 使用方法

### 記事の投稿
1. ログイン後、「記事を書く」をクリック
2. タイトル、内容を入力
3. 画像をアップロード（任意）
4. タグをカンマ区切りで入力（任意）
5. 「投稿する」をクリック

### お気に入り機能
1. 記事カードのハートアイコンをクリックしてお気に入りに追加
2. ヘッダーの「お気に入り」からお気に入り記事一覧を表示
3. メインページでもお気に入りフィルターを使用可能

### フィルター機能
1. メインページのフィルター部分で条件を選択
2. タグボタンをクリックしてタグ別に表示
3. お気に入りボタンでお気に入り記事のみ表示
4. 「フィルターをクリア」で全記事表示に戻る

## データベース構造

### 新しく追加されたテーブル

- **Favorite**: ユーザーのお気に入り記事を管理
- **Tag**: タグ情報を管理
- **PostTag**: 記事とタグの関連を管理

### 拡張されたテーブル

- **Post**: `imageUrl`フィールドを追加

## API エンドポイント

### お気に入り関連
- `GET /api/favorites` - お気に入り一覧取得
- `POST /api/favorites` - お気に入り追加
- `DELETE /api/favorites` - お気に入り削除

### タグ関連
- `GET /api/tags` - タグ一覧取得
- `POST /api/tags` - タグ作成

### ブログ関連（拡張）
- `GET /api/blog?tag=タグ名` - タグフィルター
- `GET /api/blog?favorites=true` - お気に入りフィルター

## 注意事項

1. **Supabase設定**: 画像アップロード機能を使用するには、Supabaseプロジェクトの設定が必要です
2. **ファイルサイズ制限**: 画像ファイルは5MB以下に制限されています
3. **対応形式**: JPEG、PNG形式の画像のみアップロード可能です

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.