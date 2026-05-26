import { LinkButton } from "@/components/ui/link-button";
import { ArrowLeft } from "lucide-react";
import { SchoolForm } from "@/components/admin/school-form";

export default function NewSchoolPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <LinkButton href="/admin/schools" variant="ghost" className="-ml-2">
        <ArrowLeft className="size-4" />
        Back to Schools
      </LinkButton>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add School</h1>
        <p className="text-sm text-muted-foreground">School ID will be generated automatically.</p>
      </div>
      <SchoolForm mode="create" />
    </div>
  );
}
