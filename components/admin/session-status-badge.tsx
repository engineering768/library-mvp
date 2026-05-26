import type { SessionStatus } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<SessionStatus, string> = {
  Planned: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
  Active: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  Completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  Cancelled: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", styles[status])}>
      {status}
    </Badge>
  );
}
