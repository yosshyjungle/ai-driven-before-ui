'use client';

import { useState, useEffect } from 'react';
import BlogCard from './BlogCard';

interface Post {
    id: number;
    title: string;
    description: string;
    date: string;
}

export default function BlogList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/blog');
            const data = await response.json();

            if (response.ok) {
                setPosts(data.posts || []);
            } else {
                setError('記事の取得に失敗しました');
            }
        } catch (err) {
            setError('エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchPosts}
                    className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                    再試行
                </button>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-600 text-lg">まだ記事がありません</p>
                <p className="text-gray-500 mt-2">最初の記事を書いてみませんか？</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
                <BlogCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    description={post.description}
                    date={post.date}
                />
            ))}
        </div>
    );
} 