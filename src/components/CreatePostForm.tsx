'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { uploadImage } from '../lib/supabase';
import { createPostSchema, imageFileSchema } from '@/lib/validations';

export default function CreatePostForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [tags, setTags] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { user } = useUser();

    // ユーザー情報をデータベースに同期する関数
    const syncUserToDatabase = async () => {
        if (!user) return;

        try {
            const response = await fetch('/api/sync-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: user.id,
                    email: user.primaryEmailAddress?.emailAddress,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    imageUrl: user.imageUrl,
                }),
            });

            if (!response.ok) {
                console.warn('ユーザー同期に失敗しましたが、投稿を続行します');
            }
        } catch (error) {
            console.warn('ユーザー同期エラー:', error);
        }
    };

    // 画像ファイルの選択処理
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Zodバリデーション
            const fileValidation = imageFileSchema.safeParse({
                size: file.size,
                type: file.type
            });

            if (!fileValidation.success) {
                const errors = fileValidation.error.errors.map(err => err.message).join(', ');
                setError(errors);
                return;
            }

            setImageFile(file);

            // プレビュー用のURLを生成
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            setError(null);
        }
    };

    // 画像削除
    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // タグの処理
        const tagList = tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        // Zodバリデーション
        const validationResult = createPostSchema.safeParse({
            title: title.trim(),
            description: description.trim(),
            imageUrl: null, // 画像URLは後で設定
            tags: tagList
        });

        if (!validationResult.success) {
            const errors = validationResult.error.errors.map(err => err.message).join(', ');
            setError(errors);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // ユーザー情報をデータベースに同期
            await syncUserToDatabase();

            let imageUrl = null;

            // 画像がある場合はアップロード
            if (imageFile) {
                setUploadingImage(true);
                imageUrl = await uploadImage(imageFile);
                setUploadingImage(false);

                if (!imageUrl) {
                    setError('画像のアップロードに失敗しました');
                    return;
                }
            }

            const response = await fetch('/api/blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: validationResult.data.title,
                    description: validationResult.data.description,
                    imageUrl: imageUrl,
                    tags: validationResult.data.tags,
                }),
            });

            if (response.ok) {
                router.push('/');
            } else {
                const errorData = await response.json();
                setError(errorData.error || '投稿に失敗しました');
            }
        } catch (err) {
            console.error('投稿エラー:', err);
            setError('エラーが発生しました');
        } finally {
            setLoading(false);
            setUploadingImage(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        タイトル
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="記事のタイトルを入力してください"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        内容
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={12}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-vertical"
                        placeholder="記事の内容を入力してください"
                        disabled={loading}
                    />
                </div>

                {/* 画像アップロード機能 */}
                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                        画像（任意）
                    </label>
                    <div className="space-y-4">
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                            disabled={loading}
                        />

                        {imagePreview && (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="プレビュー"
                                    className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                    disabled={loading}
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        <p className="text-xs text-gray-500">
                            JPEGまたはPNG形式、5MB以下の画像をアップロードできます
                        </p>
                    </div>
                </div>

                {/* タグ入力 */}
                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                        タグ（任意）
                    </label>
                    <input
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="タグをカンマ区切りで入力してください（例：技術, React, Web開発）"
                        disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        複数のタグを追加する場合は、カンマ（,）で区切ってください
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading || uploadingImage}
                        className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {uploadingImage ? '画像アップロード中...' : loading ? '投稿中...' : '投稿する'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        disabled={loading}
                    >
                        キャンセル
                    </button>
                </div>
            </form>
        </div>
    );
} 