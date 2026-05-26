import { LendingReturnClient } from "@/components/admin/lending-return-client";

type PageProps = { params: Promise<{ id: string }> };

export default async function LendingReturnPage({ params }: PageProps) {
  const { id } = await params;
  return <LendingReturnClient lendingId={id} />;
}
