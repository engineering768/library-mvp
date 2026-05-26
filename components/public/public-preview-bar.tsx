"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function PublicPreviewBar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAdmin(!!user);
    });
  }, []);

  if (!isAdmin) return null;

  return (
    <div className="sticky top-0 z-50 border-b bg-amber-50 text-amber-950 dark:bg-amber-950/90 dark:text-amber-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Eye className="size-4 shrink-0" />
          User view — this is what readers see on the public site
        </p>
        <Link
          href="/admin/dashboard"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-amber-300 bg-background px-3 text-sm font-medium hover:bg-muted dark:border-amber-800"
        >
          <ArrowLeft className="size-4" />
          Back to Admin
        </Link>
      </div>
    </div>
  );
}
