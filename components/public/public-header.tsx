"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/blogs", label: "Blogs" },
  { href: "/events", label: "Events" },
  { href: "/membership", label: "Membership" },
];

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          <BookOpen className="size-5 text-primary" />
          <span className="hidden sm:inline">BookBerry Library</span>
          <span className="sm:hidden">BookBerry</span>
        </Link>
        <nav className="flex items-center gap-0.5 overflow-x-auto sm:gap-1">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-lg px-2.5 py-2 text-sm font-medium sm:px-3 sm:min-h-11 sm:inline-flex sm:items-center",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
