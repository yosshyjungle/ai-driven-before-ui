import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import EditPostForm from '../../../../components/EditPostForm';

interface EditPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: EditPageProps) {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
        redirect('/sign-in');
    }

    const postId = parseInt(id);

    if (isNaN(postId)) {
        redirect('/');
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    記事を編集
                </h1>
                <p className="text-gray-600">
                    記事の内容を更新してください
                </p>
            </div>

            <EditPostForm id={postId} />
        </div>
    );
} 