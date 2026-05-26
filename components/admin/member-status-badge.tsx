import type { MemberStatus } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<MemberStatus, string> = {
  Active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  Expired: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  Suspended: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  Pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
};

export function MemberStatusBadge({
  status,
  membershipEnd,
}: {
  status: MemberStatus;
  membershipEnd?: string;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiringSoon =
    membershipEnd &&
    status === "Active" &&
    (() => {
      const end = new Date(membershipEnd);
      end.setHours(0, 0, 0, 0);
      const diff = (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    })();

  if (expiringSoon) {
    return (
      <Badge variant="outline" className="border-0 bg-amber-100 text-amber-800 font-medium">
        Expires soon
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn("border-0 font-medium", styles[status])}>
      {status}
    </Badge>
  );
}
