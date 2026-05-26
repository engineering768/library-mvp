import { Suspense } from "react";
import { SessionNewClient } from "@/components/admin/session-new-client";

export default function NewSessionPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
      <SessionNewClient />
    </Suspense>
  );
}
