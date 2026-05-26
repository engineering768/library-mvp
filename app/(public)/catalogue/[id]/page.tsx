import { BookDetailClient } from "@/components/public/book-detail-client";

type PageProps = { params: Promise<{ id: string }> };

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-3xl">
      <BookDetailClient bookId={id} />
    </div>
  );
}
