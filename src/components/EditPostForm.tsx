'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface EditPostFormProps {
    id: number;
}

interface Post {
    id: number;
    title: string;
    description: string;
    date: string;
}

export default function EditPostForm({ id }: EditPostFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            setFetching(true);
            const response = await fetch(`/api/blog/${id}`);
            const data = await response.json();

            if (response.ok && data.post) {
                setTitle(data.post.title);
                setDescription(data.post.description);
            } else {
                setError('記事の取得に失敗しました');
            }
        } catch (err) {
            setError('エラーが発生しました');
        } finally {
            setFetching(false);
        }
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

            const response = await fetch(`/api/blog/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                }),
            });

            if (response.ok) {
                router.push(`/blog/${id}`);
            } else {
                setError('記事の更新に失敗しました');
            }
        } catch (err) {
            setError('エラーが発生しました');
        } finally {
            setLoading(false);
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

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? '更新中...' : '更新する'}
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