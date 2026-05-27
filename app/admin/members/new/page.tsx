import { ArrowLeft } from "lucide-react";
import { MemberForm } from "@/components/admin/member-form";
import { LinkButton } from "@/components/ui/link-button";

export default function NewMemberPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <LinkButton href="/admin/members" variant="ghost" className="-ml-2">
        <ArrowLeft className="size-4" />
        Back to Members
      </LinkButton>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Member</h1>
        <p className="text-sm text-muted-foreground mt-1">Registering a new member — fill in their details, choose their membership plan, and their unique member ID and printable ID card are generated automatically.</p>
      </div>
      <MemberForm mode="create" />
    </div>
  );
}
