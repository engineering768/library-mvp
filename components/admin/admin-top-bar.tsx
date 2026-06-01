"use client";

import { Eye } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";

export function AdminTopBar() {
  return (
    <div className="flex items-center justify-end border-b bg-background px-4 py-2 md:px-6">
      <LinkButton
        href="/catalogue"
        target="_blank"
        rel="noopener noreferrer"
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Eye className="size-4" />
        User View
      </LinkButton>
    </div>
  );
}
