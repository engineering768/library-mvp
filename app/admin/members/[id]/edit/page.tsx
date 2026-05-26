import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/services/members";
import { MemberForm } from "@/components/admin/member-form";
import { LinkButton } from "@/components/ui/link-button";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditMemberPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  let member;
  try {
    member = await getMember(supabase, id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <LinkButton href={`/admin/members/${member.id}`} variant="ghost" className="-ml-2">
        <ArrowLeft className="size-4" />
        Back to Member
      </LinkButton>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Member</h1>
        <p className="text-sm text-muted-foreground">{member.name}</p>
      </div>
      <MemberForm member={member} mode="edit" />
    </div>
  );
}
