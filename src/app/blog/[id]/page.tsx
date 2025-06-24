'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface Post {
    id: number;
    title: string;
    description: string;
    date: string;
}

export default function BlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const { isSignedIn } = useUser();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    useEffect(() => {
        if (id) {
            fetchPost();
        }
    }, [id]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/blog/${id}`);
            const data = await response.json();

            if (response.ok && data.post) {
                setPost(data.post);
            } else {
                setError('記事が見つかりません');
            }
        } catch (err) {
            setError('エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('この記事を削除しますか？')) {
            return;
        }

        try {
            setDeleting(true);
            const response = await fetch(`/api/blog/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.push('/');
            } else {
                setError('削除に失敗しました');
            }
        } catch (err) {
            setError('エラーが発生しました');
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="text-center py-16">
                <p className="text-red-600 text-lg">{error || '記事が見つかりません'}</p>
                <Link
                    href="/"
                    className="mt-4 inline-block bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                    ホームに戻る
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-between">
                            <time className="text-sm text-gray-500">
                                {formatDate(post.date)}
                            </time>

                            {isSignedIn && (
                                <div className="flex gap-3">
                                    <Link
                                        href={`/blog/${post.id}/edit`}
                                        className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                                    >
                                        編集
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                                    >
                                        {deleting ? '削除中...' : '削除'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </header>

                    <div className="prose max-w-none">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {post.description}
                        </div>
                    </div>
                </div>
            </article>

            {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="mt-8 text-center">
                <Link
                    href="/"
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                    記事一覧に戻る
                </Link>
            </div>
        </div>
    );
} 