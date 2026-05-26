import { BlogDetailClient } from "@/components/public/blog-detail-client";

type PageProps = { params: Promise<{ slug: string }> };

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-3xl">
      <BlogDetailClient slug={slug} />
    </div>
  );
}
