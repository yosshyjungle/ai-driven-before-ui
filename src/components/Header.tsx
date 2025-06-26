'use client';

import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';

export default function Header() {
    const { isSignedIn } = useUser();

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <Link href="/" className="text-2xl font-bold text-pink-600">
                            MyBlog
                        </Link>
                        <nav className="hidden md:flex space-x-4">
                            <Link href="/" className="text-gray-700 hover:text-pink-600 transition-colors">
                                ホーム
                            </Link>
                            {isSignedIn && (
                                <>
                                    <Link href="/create" className="text-gray-700 hover:text-pink-600 transition-colors">
                                        記事を書く
                                    </Link>
                                    <Link href="/favorites" className="text-gray-700 hover:text-pink-600 transition-colors">
                                        お気に入り
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isSignedIn ? (
                            <UserButton />
                        ) : (
                            <Link
                                href="/sign-in"
                                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                            >
                                ログイン
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
} 