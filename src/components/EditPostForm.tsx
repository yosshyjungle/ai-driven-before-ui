'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { uploadImage, deleteImage } from '../lib/supabase';
import { imageFileSchema } from '@/lib/validations';

interface EditPostFormProps {
    id: number;
}



export default function EditPostForm({ id }: EditPostFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchPost = useCallback(async () => {
        try {
            setFetching(true);
            const response = await fetch(`/api/blog/${id}`);
            const data = await response.json();

            if (response.ok && data.post) {
                setTitle(data.post.title);
                setDescription(data.post.description);
                setCurrentImageUrl(data.post.imageUrl || null);
            } else {
                setError('記事の取得に失敗しました');
            }
        } catch {
            setError('エラーが発生しました');
        } finally {
            setFetching(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

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

    // 新しい画像の削除
    const removeNewImage = () => {
        setImageFile(null);
        setImagePreview('');
    };

    // 既存画像の削除
    const removeCurrentImage = () => {
        setCurrentImageUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            setError('タイトルと内容を入力してください');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let imageUrl = currentImageUrl;

            // 新しい画像がある場合はアップロード
            if (imageFile) {
                setUploadingImage(true);
                const newImageUrl = await uploadImage(imageFile);
                setUploadingImage(false);

                if (!newImageUrl) {
                    setError('画像のアップロードに失敗しました');
                    return;
                }

                // 古い画像を削除
                if (currentImageUrl) {
                    await deleteImage(currentImageUrl);
                }

                imageUrl = newImageUrl;
            }

            const response = await fetch(`/api/blog/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    imageUrl: imageUrl,
                }),
            });

            if (response.ok) {
                router.push(`/blog/${id}`);
            } else {
                setError('記事の更新に失敗しました');
            }
        } catch {
            setError('エラーが発生しました');
        } finally {
            setLoading(false);
            setUploadingImage(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
        );
    }

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
                        {/* 既存の画像表示 */}
                        {currentImageUrl && !imagePreview && (
                            <div className="relative">
                                <img
                                    src={currentImageUrl}
                                    alt="現在の画像"
                                    className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={removeCurrentImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                    disabled={loading}
                                >
                                    ×
                                </button>
                                <p className="text-xs text-gray-500 mt-1">現在の画像</p>
                            </div>
                        )}

                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                            disabled={loading}
                        />

                        {/* 新しい画像のプレビュー */}
                        {imagePreview && (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="新しい画像のプレビュー"
                                    className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={removeNewImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                    disabled={loading}
                                >
                                    ×
                                </button>
                                <p className="text-xs text-gray-500 mt-1">新しい画像のプレビュー</p>
                            </div>
                        )}

                        <p className="text-xs text-gray-500">
                            JPEGまたはPNG形式、5MB以下の画像をアップロードできます
                        </p>
                    </div>
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
                        {uploadingImage ? '画像アップロード中...' : loading ? '更新中...' : '更新する'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push(`/blog/${id}`)}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        キャンセル
                    </button>
                </div>
            </form>
        </div>
    );
} 