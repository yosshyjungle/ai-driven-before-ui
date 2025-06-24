'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePostForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            setError('タイトルと内容を入力してください');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                }),
            });

            if (response.ok) {
                router.push('/');
            } else {
                const data = await response.json();
                setError('記事の投稿に失敗しました');
            }
        } catch (err) {
            setError('エラーが発生しました');
        } finally {
            setLoading(false);
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
                        {loading ? '投稿中...' : '投稿する'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        キャンセル
                    </button>
                </div>
            </form>
        </div>
    );
} 