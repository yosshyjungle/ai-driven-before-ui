import Link from 'next/link';

interface BlogCardProps {
    id: number;
    title: string;
    description: string;
    date: string;
}

export default function BlogCard({ id, title, description, date }: BlogCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <article className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <Link href={`/blog/${id}`} className="block p-6">
                <div className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900 line-clamp-2 hover:text-pink-600 transition-colors">
                        {title}
                    </h2>
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
            </Link>
        </article>
    );
} 