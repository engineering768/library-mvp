import type { BookStatus } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<BookStatus, string> = {
  Available: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  "Out - Session": "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  "Out - Member": "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  Missing: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  Damaged: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  Retired: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

export function StatusBadge({ status }: { status: BookStatus }) {
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", statusStyles[status])}>
      {status}
    </Badge>
  );
}
