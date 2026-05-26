import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function SessionSheetPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/api/sessions/${id}/sheet`);
}
