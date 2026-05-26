import Link from "next/link";
import { BookOpen } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <BookOpen className="size-4 text-primary" />
          BookBerry · Prerna Community Library
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <Link href="/catalogue" className="hover:text-foreground">Catalogue</Link>
          <Link href="/blogs" className="hover:text-foreground">Blogs</Link>
          <Link href="/events" className="hover:text-foreground">Events</Link>
          <Link href="/membership" className="hover:text-foreground">Membership</Link>
        </nav>
      </div>
    </footer>
  );
}
