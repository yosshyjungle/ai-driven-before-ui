import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
}

interface Tag {
    id: number;
    name: string;
    color: string;
}

interface Post {
    id: number;
    title: string;
    description: string;
    date: string;
    imageUrl?: string;
    user: User;
    tags: Tag[];
    favoriteCount: number;
}

const fetchPost = async (id: number): Promise<Post | null> => {
    try {
        const baseUrl = process.env.NODE_ENV === 'production'
            ? process.env.NEXTAUTH_URL || 'https://your-domain.com'
            : 'http://localhost:3000';

        const response = await fetch(`${baseUrl}/api/public/blog/${id}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.post;
    } catch (error) {
        console.error('記事取得エラー:', error);
        return null;
    }
};

const getDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
        return user.firstName;
    } else if (user.lastName) {
        return user.lastName;
    }
    return 'ユーザー';
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export default async function PublicBlogDetailPage({ params }: PageProps) {
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
        notFound();
    }

    const post = await fetchPost(postId);

    if (!post) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* ナビゲーション */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Link href="/browse" className="hover:text-pink-600 transition-colors">
                    ← 記事一覧に戻る
                </Link>
            </div>

            {/* 記事ヘッダー */}
            <header className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                    {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {/* 作者情報 */}
                    <div className="flex items-center gap-2">
                        {post.user.imageUrl && (
                            <img
                                src={post.user.imageUrl}
                                alt={getDisplayName(post.user)}
                                className="w-8 h-8 rounded-full"
                            />
                        )}
                        <span>by {getDisplayName(post.user)}</span>
                    </div>

                    {/* 投稿日 */}
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <time>{formatDate(post.date)}</time>
                    </div>

                    {/* お気に入り数 */}
                    {post.favoriteCount > 0 && (
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{post.favoriteCount} お気に入り</span>
                        </div>
                    )}
                </div>

                {/* タグ */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <span
                                key={tag.id}
                                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                style={{ backgroundColor: tag.color }}
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}
            </header>

            {/* メイン画像 */}
            {post.imageUrl && (
                <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
                    <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* 記事本文 */}
            <article className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6 md:p-8">
                    <div className="prose prose-lg max-w-none">
                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                            {post.description}
                        </div>
                    </div>
                </div>
            </article>

            {/* フッター */}
            <footer className="text-center py-8 border-t border-gray-200">
                <Link
                    href="/browse"
                    className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors inline-flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    他の記事も見る
                </Link>
            </footer>
        </div>
    );
} 