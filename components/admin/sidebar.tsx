"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  CreditCard,
  Eye,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  PenLine,
  RefreshCw,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/books", label: "Books", icon: BookOpen },
  { href: "/admin/schools", label: "Schools", icon: GraduationCap },
  { href: "/admin/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/lending", label: "Lending", icon: RefreshCw },
  { href: "/admin/blogs", label: "Blogs", icon: PenLine },
  { href: "/admin/events", label: "Events", icon: Megaphone },
  { href: "/admin/plans", label: "Plans", icon: CreditCard },
];

export function AdminSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-sidebar md:text-sidebar-foreground">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <BookOpen className="size-5 text-primary" />
          BookBerry
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t p-4">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/60"
        >
          <Eye className="size-4" />
          User View
        </Link>
        <Link
          href="#"
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-sidebar-foreground/80 opacity-40"
        >
          <Settings className="size-4" />
          Settings
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 min-h-11"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
