"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { School } from "@/lib/supabase/types";

type SchoolFormProps = {
  school?: School;
  mode: "create" | "edit";
};

export function SchoolForm({ school, mode }: SchoolFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      type: String(form.get("type") ?? "Municipal"),
      area: String(form.get("area") ?? "") || null,
      ward: String(form.get("ward") ?? "") || null,
      contact_person: String(form.get("contact_person") ?? "") || null,
      contact_number: String(form.get("contact_number") ?? "") || null,
      medium: String(form.get("medium") ?? "") || null,
      std_range: String(form.get("std_range") ?? "") || null,
      active: form.get("active") === "on",
      notes: String(form.get("notes") ?? "") || null,
    };

    const url = mode === "create" ? "/api/schools" : `/api/schools/${school!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push(`/admin/schools/${data.school.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24 md:pb-6">
      {school && (
        <div className="rounded-lg border bg-muted/40 p-4">
          <Label className="text-muted-foreground">School ID</Label>
          <p className="text-lg font-semibold">{school.school_id}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">School Name *</Label>
          <Input id="name" name="name" defaultValue={school?.name} required className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <select id="type" name="type" defaultValue={school?.type ?? "Municipal"} className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-base">
            <option value="Municipal">Municipal</option>
            <option value="Private">Private</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="medium">Medium</Label>
          <select id="medium" name="medium" defaultValue={school?.medium ?? ""} className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-base">
            <option value="">Select medium</option>
            <option value="Marathi">Marathi</option>
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
            <option value="Semi-English">Semi-English</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="area">Area</Label>
          <Input id="area" name="area" defaultValue={school?.area ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ward">Ward</Label>
          <Input id="ward" name="ward" defaultValue={school?.ward ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="std_range">Std Range</Label>
          <Input id="std_range" name="std_range" defaultValue={school?.std_range ?? ""} placeholder="e.g. 1st to 7th" className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input id="contact_person" name="contact_person" defaultValue={school?.contact_person ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_number">Contact Number</Label>
          <Input id="contact_number" name="contact_number" defaultValue={school?.contact_number ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" defaultValue={school?.notes ?? ""} rows={3} className="text-base" />
        </div>
        <div className="flex items-center gap-3 md:col-span-2">
          <Checkbox id="active" name="active" defaultChecked={school?.active ?? true} />
          <Label htmlFor="active">Active</Label>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="fixed bottom-16 left-0 right-0 border-t bg-background p-4 md:static md:border-0 md:p-0">
        <Button type="submit" disabled={loading} size="lg" className="w-full md:w-auto min-h-11">
          {loading ? "Saving..." : mode === "create" ? "Create School" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
