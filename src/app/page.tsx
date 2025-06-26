'use client';

import { useUser } from '@clerk/nextjs';
import BlogList from "../components/BlogList";
import PublicBlogList from "../components/PublicBlogList";
import Link from 'next/link';

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (isSignedIn) {
    // ログインユーザー向けのページ（従来の機能）
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            最新の記事
          </h1>
          <p className="text-gray-600">
            新しい記事をチェックしてみてください
          </p>
        </div>

        <BlogList />
      </div>
    );
  }

  // 未ログインユーザー向けのページ（閲覧専用）
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ブログを読む
        </h1>
        <p className="text-gray-600 mb-6">
          みんなが投稿した記事を自由に閲覧できます
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-in"
            className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
          >
            ログインして記事を投稿
          </Link>
          <Link
            href="/browse"
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            記事を閲覧する
          </Link>
        </div>
      </div>

      <PublicBlogList />
    </div>
  );
}
