import { EventDetailClient } from "@/components/admin/event-detail-client";

type PageProps = { params: Promise<{ id: string }> };

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <EventDetailClient eventId={id} />;
}
