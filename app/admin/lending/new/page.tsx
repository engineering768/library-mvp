import { Suspense } from "react";
import { LendingNewClient } from "@/components/admin/lending-new-client";

export default function NewLendingPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
      <LendingNewClient />
    </Suspense>
  );
}
