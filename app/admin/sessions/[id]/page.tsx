import { SessionDetailClient } from "@/components/admin/session-detail-client";

type PageProps = { params: Promise<{ id: string }> };

export default async function SessionDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <SessionDetailClient sessionId={id} />;
}
