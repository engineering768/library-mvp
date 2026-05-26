"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { School } from "@/lib/supabase/types";
import { LinkButton } from "@/components/ui/link-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function SchoolsPageClient() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (activeOnly) params.set("active", "true");

    const res = await fetch(`/api/schools?${params}`);
    const data = await res.json();
    setSchools(data.schools ?? []);
    setLoading(false);
  }, [type, activeOnly]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Schools</h1>
          <p className="text-sm text-muted-foreground">Municipal and private partner schools</p>
        </div>
        <LinkButton href="/admin/schools/new">
          <Plus className="size-4" />
          Add School
        </LinkButton>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="min-h-11 rounded-lg border border-input bg-background px-3 text-base"
        >
          <option value="">All types</option>
          <option value="Municipal">Municipal</option>
          <option value="Private">Private</option>
        </select>
        <label className="flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          Active only
        </label>
      </div>

      <div className="hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Medium</TableHead>
              <TableHead>Std Range</TableHead>
              <TableHead>Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-mono text-sm">
                      <Link href={`/admin/schools/${school.id}`} className="hover:underline">
                        {school.school_id}
                      </Link>
                    </TableCell>
                    <TableCell>{school.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{school.type}</Badge>
                    </TableCell>
                    <TableCell>{school.area ?? "—"}</TableCell>
                    <TableCell>{school.medium ?? "—"}</TableCell>
                    <TableCell>{school.std_range ?? "—"}</TableCell>
                    <TableCell>{school.active ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {schools.map((school) => (
          <Link key={school.id} href={`/admin/schools/${school.id}`} className="block rounded-lg border p-4">
            <p className="font-mono text-xs text-muted-foreground">{school.school_id}</p>
            <p className="font-medium">{school.name}</p>
            <p className="text-sm text-muted-foreground">{school.type} · {school.area ?? "No area"}</p>
          </Link>
        ))}
      </div>

      {!loading && schools.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="font-medium">No schools yet</p>
          <LinkButton href="/admin/schools/new" className="mt-4">Add School</LinkButton>
        </div>
      )}
    </div>
  );
}
