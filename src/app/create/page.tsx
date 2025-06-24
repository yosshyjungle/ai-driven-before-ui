import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CreatePostForm from '../../components/CreatePostForm';

export default async function CreatePage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    新しい記事を書く
                </h1>
                <p className="text-gray-600">
                    あなたの想いを記事にしてみてください
                </p>
            </div>

            <CreatePostForm />
        </div>
    );
} 