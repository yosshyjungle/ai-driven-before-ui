'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface BlogCardProps {
    id: number;
    title: string;
    description: string;
    date: string;
    imageUrl?: string;
    isFavorited?: boolean;
    onFavoriteChange?: () => void;
}

export default function BlogCard({
    id,
    title,
    description,
    date,
    imageUrl,
    isFavorited = false,
    onFavoriteChange
}: BlogCardProps) {
    const [favorited, setFavorited] = useState(isFavorited);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const { isSignedIn } = useUser();

    useEffect(() => {
        setFavorited(isFavorited);
    }, [isFavorited]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isSignedIn || favoriteLoading) return;

        try {
            setFavoriteLoading(true);

            const endpoint = '/api/favorites';
            const method = favorited ? 'DELETE' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ postId: id }),
            });

            if (response.ok) {
                setFavorited(!favorited);
                onFavoriteChange?.();
            } else {
                console.error('お気に入り操作に失敗しました');
            }
        } catch (error) {
            console.error('お気に入り操作エラー:', error);
        } finally {
            setFavoriteLoading(false);
        }
    };

    return (
        <article className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <Link href={`/blog/${id}`} className="block">
                {imageUrl && (
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                        <img
                            src={imageUrl}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div className="p-6">
                    <div className="space-y-3">
                        <div className="flex items-start justify-between">
                            <h2 className="text-xl font-semibold text-gray-900 line-clamp-2 hover:text-pink-600 transition-colors flex-1">
                                {title}
                            </h2>
                            {isSignedIn && (
                                <button
                                    onClick={handleFavoriteClick}
                                    disabled={favoriteLoading}
                                    className={`ml-3 p-1 rounded-full transition-colors ${favorited
                                            ? 'text-red-500 hover:text-red-600'
                                            : 'text-gray-400 hover:text-red-500'
                                        } ${favoriteLoading ? 'opacity-50' : ''}`}
                                    title={favorited ? 'お気に入りから削除' : 'お気に入りに追加'}
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill={favorited ? 'currentColor' : 'none'}
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-3">
                            {description}
                        </p>
                        <div className="flex items-center justify-between">
                            <time className="text-xs text-gray-500">
                                {formatDate(date)}
                            </time>
                            <span className="text-pink-600 text-sm font-medium hover:underline">
                                続きを読む →
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
} 