import BlogList from "../components/BlogList";

export default function Home() {
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
