"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ImportPageClient() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/books/import", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.error ?? "Import failed");
      return;
    }

    setResult({
      imported: data.imported,
      skipped: data.skipped,
      errors: data.errors ?? [],
    });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import Books</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Adding a large batch of books? Upload a CSV file to add them all at once instead of entering each one manually. A BBID label is automatically generated for every new book.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">CSV Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label
            htmlFor="csv-upload"
            className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-6 text-center"
          >
            <Upload className="mb-2 size-8 text-muted-foreground" />
            <span className="font-medium">
              {file ? file.name : "Drop CSV here or tap to browse"}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              Supports Prerna catalog CSV: Title of the book, Publication, Age group, SEL, Setting, etc.
            </span>
            <input
              id="csv-upload"
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={handleImport}
            disabled={!file || loading}
            className="min-h-11 w-full"
          >
            {loading ? "Importing..." : "Import Books"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Import Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>{result.imported}</strong> imported,{" "}
              <strong>{result.skipped}</strong> skipped
            </p>
            {result.errors.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {result.errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}
            <LinkButton href="/admin/books" variant="outline" className="mt-4">
              View Books
            </LinkButton>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
