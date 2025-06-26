import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import BlogList from '../../components/BlogList';

export default async function FavoritesPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    お気に入り記事
                </h1>
                <p className="text-gray-600">
                    あなたがお気に入りに追加した記事の一覧です
                </p>
            </div>

            {/* お気に入りフィルターを自動で有効にしたBlogListコンポーネント */}
            <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                        💡 ヒント: メインページでもお気に入りフィルターを使って同じ記事を表示できます
                    </p>
                </div>
                <BlogList />
            </div>
        </div>
    );
} 