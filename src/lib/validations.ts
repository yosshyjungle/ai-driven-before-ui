import { z } from 'zod'

// ブログ投稿のバリデーションスキーマ
export const createPostSchema = z.object({
    title: z.string()
        .min(1, 'タイトルは必須です')
        .max(200, 'タイトルは200文字以内で入力してください')
        .trim(),
    description: z.string()
        .min(1, '内容は必須です')
        .max(10000, '内容は10000文字以内で入力してください')
        .trim(),
    imageUrl: z.string()
        .url('有効なURLを入力してください')
        .optional()
        .nullable(),
    tags: z.array(z.string().trim().min(1))
        .max(10, 'タグは10個まで追加できます')
        .optional()
        .default([])
})

// ブログ投稿更新のバリデーションスキーマ
export const updatePostSchema = z.object({
    title: z.string()
        .min(1, 'タイトルは必須です')
        .max(200, 'タイトルは200文字以内で入力してください')
        .trim(),
    description: z.string()
        .min(1, '内容は必須です')
        .max(10000, '内容は10000文字以内で入力してください')
        .trim(),
    imageUrl: z.string()
        .url('有効なURLを入力してください')
        .optional()
        .nullable()
})

// ユーザー同期のバリデーションスキーマ
export const syncUserSchema = z.object({
    id: z.string().min(1, 'ユーザーIDは必須です'),
    email: z.string()
        .email('有効なメールアドレスを入力してください')
        .min(1, 'メールアドレスは必須です'),
    firstName: z.string()
        .max(50, '名前は50文字以内で入力してください')
        .optional()
        .nullable(),
    lastName: z.string()
        .max(50, '名前は50文字以内で入力してください')
        .optional()
        .nullable(),
    imageUrl: z.string()
        .url('有効なURLを入力してください')
        .optional()
        .nullable()
})

// お気に入り追加のバリデーションスキーマ
export const addFavoriteSchema = z.object({
    postId: z.number()
        .int('投稿IDは整数である必要があります')
        .positive('投稿IDは正の数である必要があります')
})

// タグ作成のバリデーションスキーマ
export const createTagSchema = z.object({
    name: z.string()
        .min(1, 'タグ名は必須です')
        .max(50, 'タグ名は50文字以内で入力してください')
        .trim(),
    color: z.string()
        .regex(/^#[0-9A-Fa-f]{6}$/, '有効なカラーコードを入力してください（例: #FF0000）')
        .optional()
        .default('#3B82F6')
})

// パラメータバリデーション用
export const idParamSchema = z.object({
    id: z.string()
        .regex(/^\d+$/, 'IDは数値である必要があります')
        .transform((val) => parseInt(val, 10))
})

// ファイルアップロード用のバリデーション
export const imageFileSchema = z.object({
    size: z.number()
        .max(5 * 1024 * 1024, '画像ファイルは5MB以下にしてください'),
    type: z.string()
        .regex(/^image\/(jpeg|jpg|png|gif|webp)$/, 'JPEG、PNG、GIF、WebP形式の画像ファイルのみアップロード可能です')
})

// 型エクスポート
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type SyncUserInput = z.infer<typeof syncUserSchema>
export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>
export type CreateTagInput = z.infer<typeof createTagSchema>
export type IdParam = z.infer<typeof idParamSchema>
export type ImageFileValidation = z.infer<typeof imageFileSchema> 