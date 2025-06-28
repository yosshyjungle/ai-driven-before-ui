import PublicBlogList from "../../components/PublicBlogList";

export default function BrowsePage() {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    記事を閲覧する
                </h1>
                <p className="text-gray-600">
                    みんなが投稿した記事を自由に閲覧できます
                </p>
            </div>

            <PublicBlogList />
        </div>
    );
} 