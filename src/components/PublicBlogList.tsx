'use client';

import { useState, useEffect, useCallback } from 'react';
import BlogCard from './BlogCard';

interface Tag {
    id: number;
    name: string;
    color: string;
    _count?: {
        postTags: number;
    };
}

interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
}

interface Post {
    id: number;
    title: string;
    description: string;
    date: string;
    imageUrl?: string;
    user: User;
    tags?: Tag[];
    favoriteCount?: number;
    isFavorited: boolean;
}

export default function PublicBlogList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string>('');

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/public/tags');
            const data = await response.json();
            if (response.ok) {
                setAllTags(data.tags || []);
            }
        } catch (error) {
            console.error('公開タグ取得エラー:', error);
        }
    };

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            if (selectedTag) {
                params.append('tag', selectedTag);
            }

            const url = `/api/public/blog${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setPosts(data.posts || []);
            } else {
                setError('記事の取得に失敗しました');
            }
        } catch {
            setError('エラーが発生しました');
        } finally {
            setLoading(false);
        }
    }, [selectedTag]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const clearFilters = () => {
        setSelectedTag('');
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

    return (
        <div className="space-y-6">
            {/* フィルター部分（お気に入りフィルターは除外） */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                    {/* タグフィルター */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">タグで絞り込み:</span>
                        {allTags.map((tag) => (
                            <button
                                key={tag.id}
                                onClick={() => setSelectedTag(selectedTag === tag.name ? '' : tag.name)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedTag === tag.name
                                    ? 'text-white border border-transparent'
                                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                                    }`}
                                style={{
                                    backgroundColor: selectedTag === tag.name ? tag.color : undefined
                                }}
                            >
                                {tag.name}
                                {tag._count && (
                                    <span className="ml-1 text-xs opacity-75">
                                        ({tag._count.postTags})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* フィルタークリア */}
                    {selectedTag && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            フィルターをクリア
                        </button>
                    )}
                </div>

                {/* アクティブなフィルターの表示 */}
                {selectedTag && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>表示中:</span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                タグ: {selectedTag}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* 記事一覧 */}
            {posts.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-600 text-lg">
                        {selectedTag ? 'フィルター条件に一致する記事がありません' : 'まだ記事がありません'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <BlogCard
                            key={post.id}
                            id={post.id}
                            title={post.title}
                            description={post.description}
                            date={post.date}
                            imageUrl={post.imageUrl}
                            isFavorited={post.isFavorited}
                            onFavoriteChange={() => { }} // 閲覧専用なので空の関数
                            showFavoriteButton={false} // お気に入りボタンを非表示
                            isPublicView={true} // 公開ビューフラグ
                            author={post.user} // 作者情報を追加
                            favoriteCount={post.favoriteCount} // お気に入り数表示用
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 