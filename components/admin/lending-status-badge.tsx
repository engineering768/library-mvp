import type { LendingStatus } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<LendingStatus, string> = {
  Active: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  Overdue: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  Returned: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  Lost: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

export function LendingStatusBadge({ status }: { status: LendingStatus }) {
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", styles[status])}>
      {status}
    </Badge>
  );
}
