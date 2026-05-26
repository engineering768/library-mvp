import { MemberDetailClient } from "@/components/admin/member-detail-client";

type PageProps = { params: Promise<{ id: string }> };

export default async function MemberDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <MemberDetailClient memberId={id} />;
}
