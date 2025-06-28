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

interface Post {
    id: number;
    title: string;
    description: string;
    date: string;
    imageUrl?: string;
    isFavorited?: boolean;
    favoriteCount?: number;
    tags?: Tag[];
}

export default function BlogList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            if (selectedTag) {
                params.append('tag', selectedTag);
            }
            if (showFavoritesOnly) {
                params.append('favorites', 'true');
            }

            const url = `/api/blog${params.toString() ? `?${params.toString()}` : ''}`;
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
    }, [selectedTag, showFavoritesOnly]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tags');
            const data = await response.json();
            if (response.ok) {
                setAllTags(data.tags || []);
            }
        } catch (error) {
            console.error('タグ取得エラー:', error);
        }
    };



    const handleFavoriteChange = () => {
        // お気に入り状態が変更されたら記事一覧を再取得
        fetchPosts();
    };

    const clearFilters = () => {
        setSelectedTag('');
        setShowFavoritesOnly(false);
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
            {/* フィルター部分 */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">フィルター:</label>

                        {/* お気に入りフィルター */}
                        <button
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${showFavoritesOnly
                                    ? 'bg-red-100 text-red-700 border border-red-300'
                                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                                }`}
                        >
                            ❤️ お気に入り
                        </button>
                    </div>

                    {/* タグフィルター */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-gray-600">タグ:</span>
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
                    {(selectedTag || showFavoritesOnly) && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            フィルターをクリア
                        </button>
                    )}
                </div>

                {/* アクティブなフィルターの表示 */}
                {(selectedTag || showFavoritesOnly) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>表示中:</span>
                            {showFavoritesOnly && (
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                                    お気に入り
                                </span>
                            )}
                            {selectedTag && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    タグ: {selectedTag}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 記事一覧 */}
            {posts.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-600 text-lg">
                        {selectedTag || showFavoritesOnly ? 'フィルター条件に一致する記事がありません' : 'まだ記事がありません'}
                    </p>
                    {!selectedTag && !showFavoritesOnly && (
                        <p className="text-gray-500 mt-2">最初の記事を書いてみませんか？</p>
                    )}
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
                            onFavoriteChange={handleFavoriteChange}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 