import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BookLocation,
  SessionDetail,
  SessionStatus,
  SessionWithSchool,
} from "@/lib/supabase/types";
import { generateSessionId } from "@/lib/utils/session-id";
import type { SessionFormValues } from "@/lib/validations/session";

export type SessionListParams = {
  status?: string;
  school_id?: string;
  date_from?: string;
  date_to?: string;
};

const UNAVAILABLE_STATUSES = ["Out - Session", "Out - Member"];

export async function listSessions(
  supabase: SupabaseClient,
  params: SessionListParams = {}
) {
  let query = supabase
    .from("sessions")
    .select(
      `
      *,
      school:schools ( id, school_id, name, type ),
      session_books ( id, returned )
    `
    )
    .order("date", { ascending: false });

  if (params.status) query = query.eq("status", params.status);
  if (params.school_id) query = query.eq("school_id", params.school_id);
  if (params.date_from) query = query.gte("date", params.date_from);
  if (params.date_to) query = query.lte("date", params.date_to);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => {
    const books = (row.session_books as { returned: boolean | null }[]) ?? [];
    return {
      ...(row as Omit<typeof row, "session_books" | "school">),
      school: row.school,
      books_out: books.length,
      books_returned: books.filter((b) => b.returned === true).length,
      missing: books.filter((b) => b.returned === false).length,
    };
  }) as (SessionWithSchool & {
    books_out: number;
    books_returned: number;
    missing: number;
  })[];
}

export async function getSession(
  supabase: SupabaseClient,
  id: string
): Promise<SessionDetail> {
  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
      *,
      school:schools ( id, school_id, name, type ),
      session_books (
        id, session_id, book_id, carried, returned, condition_note, returned_at,
        book:books ( id, bbid, title, author, status, condition )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as SessionDetail;
}

async function validateBooksAvailable(
  supabase: SupabaseClient,
  bookIds: string[]
) {
  const { data, error } = await supabase
    .from("books")
    .select("id, bbid, title, status")
    .in("id", bookIds);

  if (error) throw error;

  const unavailable = (data ?? []).filter((b) =>
    UNAVAILABLE_STATUSES.includes(b.status)
  );

  if (unavailable.length) {
    throw new Error(
      `Books unavailable: ${unavailable.map((b) => b.bbid).join(", ")}`
    );
  }
}

export async function createSession(
  supabase: SupabaseClient,
  payload: SessionFormValues
) {
  await validateBooksAvailable(supabase, payload.book_ids);

  const session_id = await generateSessionId(supabase, payload.date);

  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      session_id,
      school_id: payload.school_id,
      date: payload.date,
      class_grade: payload.class_grade ?? null,
      division: payload.division ?? null,
      approx_student_count: payload.approx_student_count ?? null,
      conducted_by: payload.conducted_by ?? "Prema",
      notes: payload.notes ?? null,
      status: "Planned",
    })
    .select()
    .single();

  if (error) throw error;

  const sessionBooks = payload.book_ids.map((book_id) => ({
    session_id: session.id,
    book_id,
    carried: true,
  }));

  const { error: booksError } = await supabase
    .from("session_books")
    .insert(sessionBooks);

  if (booksError) throw booksError;

  return getSession(supabase, session.id);
}

export async function updateSession(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<Omit<SessionFormValues, "book_ids">>
) {
  const existing = await getSession(supabase, id);
  if (existing.status !== "Planned") {
    throw new Error("Only planned sessions can be edited");
  }

  const { error } = await supabase
    .from("sessions")
    .update({
      school_id: payload.school_id,
      date: payload.date,
      class_grade: payload.class_grade ?? null,
      division: payload.division ?? null,
      approx_student_count: payload.approx_student_count ?? null,
      conducted_by: payload.conducted_by ?? "Prema",
      notes: payload.notes ?? null,
    })
    .eq("id", id);

  if (error) throw error;
  return getSession(supabase, id);
}

export async function deleteSession(supabase: SupabaseClient, id: string) {
  const session = await getSession(supabase, id);
  if (session.status !== "Planned") {
    throw new Error("Only planned sessions can be deleted");
  }

  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) throw error;
}

export async function activateSession(supabase: SupabaseClient, id: string) {
  const session = await getSession(supabase, id);

  if (session.status !== "Planned") {
    throw new Error("Only planned sessions can be activated");
  }

  if (!session.session_books.length) {
    throw new Error("Session must have at least one book");
  }

  const bookIds = session.session_books.map((sb) => sb.book_id);
  await validateBooksAvailable(supabase, bookIds);

  for (const bookId of bookIds) {
    const { error } = await supabase
      .from("books")
      .update({ status: "Out - Session" })
      .eq("id", bookId);

    if (error) throw error;
  }

  const { error } = await supabase
    .from("sessions")
    .update({ status: "Active" })
    .eq("id", id);

  if (error) throw error;
  return getSession(supabase, id);
}

export async function returnSessionBook(
  supabase: SupabaseClient,
  sessionId: string,
  bookId: string,
  options: { condition_note?: string | null; damaged?: boolean } = {}
) {
  const session = await getSession(supabase, sessionId);

  if (session.status !== "Active") {
    throw new Error("Books can only be returned during an active session");
  }

  const sessionBook = session.session_books.find((sb) => sb.book_id === bookId);
  if (!sessionBook) throw new Error("Book not in this session");
  if (sessionBook.returned === true) throw new Error("Book already returned");

  const { error: sbError } = await supabase
    .from("session_books")
    .update({
      returned: true,
      returned_at: new Date().toISOString(),
      condition_note: options.condition_note ?? null,
    })
    .eq("id", sessionBook.id);

  if (sbError) throw sbError;

  const bookUpdate: { status: string; condition?: string } = {
    status: "Available",
  };
  if (options.damaged || options.condition_note) {
    bookUpdate.condition = "Damaged";
  }

  const { error: bookError } = await supabase
    .from("books")
    .update(bookUpdate)
    .eq("id", bookId);

  if (bookError) throw bookError;
  return getSession(supabase, sessionId);
}

export async function closeSession(supabase: SupabaseClient, id: string) {
  const session = await getSession(supabase, id);

  if (session.status !== "Active") {
    throw new Error("Only active sessions can be closed");
  }

  const pending = session.session_books.filter((sb) => sb.returned === null);

  for (const sb of pending) {
    await supabase
      .from("session_books")
      .update({ returned: false })
      .eq("id", sb.id);

    await supabase
      .from("books")
      .update({ status: "Missing" })
      .eq("id", sb.book_id);
  }

  const { error } = await supabase
    .from("sessions")
    .update({ status: "Completed" })
    .eq("id", id);

  if (error) throw error;
  return getSession(supabase, id);
}

export async function getTodaysSessionsCount(supabase: SupabaseClient) {
  const today = new Date().toISOString().slice(0, 10);
  const { count, error } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("date", today);

  if (error) throw error;
  return count ?? 0;
}

export async function getBookLocation(
  supabase: SupabaseClient,
  bookId: string
): Promise<BookLocation> {
  const { data: book, error } = await supabase
    .from("books")
    .select("id, bbid, title, author, status")
    .eq("id", bookId)
    .single();

  if (error) throw error;

  if (book.status === "Out - Member") {
    const { data: lendingRow } = await supabase
      .from("lending_transactions")
      .select(
        `
        transaction_id, due_date,
        member:members ( member_id, name )
      `
      )
      .eq("book_id", bookId)
      .in("status", ["Active", "Overdue"])
      .limit(1)
      .maybeSingle();

    const lending = lendingRow as unknown as {
      transaction_id: string;
      due_date: string;
      member: { member_id: string; name: string };
    } | null;

    if (lending) {
      return {
        book,
        current_member: {
          member_id: lending.member.member_id,
          member_name: lending.member.name,
          due_date: lending.due_date,
          transaction_id: lending.transaction_id,
        },
        last_seen: lending.due_date,
      };
    }
  }

  if (book.status === "Out - Session") {
    const { data: activeRow } = await supabase
      .from("session_books")
      .select(
        `
        returned,
        session:sessions (
          session_id, date, status,
          school:schools ( name )
        )
      `
      )
      .eq("book_id", bookId)
      .is("returned", null)
      .limit(1)
      .maybeSingle();

    const session = activeRow?.session as unknown as {
      session_id: string;
      date: string;
      status: string;
      school: { name: string };
    } | null;

    if (session) {
      return {
        book,
        current_session: {
          session_id: session.session_id,
          school_name: session.school.name,
          date: session.date,
          status: session.status as SessionStatus,
        },
        last_seen: session.date,
      };
    }
  }

  if (book.status === "Missing") {
    const { data: missingRow } = await supabase
      .from("session_books")
      .select(
        `
        session:sessions (
          session_id, date,
          school:schools ( name )
        )
      `
      )
      .eq("book_id", bookId)
      .eq("returned", false)
      .order("returned_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const session = missingRow?.session as unknown as {
      session_id: string;
      date: string;
      school: { name: string };
    } | null;

    if (session) {
      return {
        book,
        missing_from_session: {
          session_id: session.session_id,
          school_name: session.school.name,
          date: session.date,
        },
        last_seen: session.date,
      };
    }
  }

  const { data: lastRow } = await supabase
    .from("session_books")
    .select("returned_at, session:sessions ( date )")
    .eq("book_id", bookId)
    .not("returned_at", "is", null)
    .order("returned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastDate = (lastRow?.session as unknown as { date: string } | null)?.date ?? null;

  return {
    book,
    last_seen: lastDate,
  };
}

export async function searchBookLocation(
  supabase: SupabaseClient,
  query: string
): Promise<BookLocation[]> {
  const term = `%${query.trim()}%`;
  const { data, error } = await supabase
    .from("books")
    .select("id")
    .or(`bbid.ilike.${term},title.ilike.${term}`)
    .limit(10);

  if (error) throw error;

  const results: BookLocation[] = [];
  for (const row of data ?? []) {
    results.push(await getBookLocation(supabase, row.id));
  }
  return results;
}

export function buildSessionSheetHtml(session: SessionDetail) {
  const classLabel = [session.class_grade, session.division]
    .filter(Boolean)
    .join(" ");

  const rows = session.session_books
    .map(
      (sb, i) => `
    <tr>
      <td>${i + 1}.</td>
      <td>${sb.book.bbid}</td>
      <td>${escapeHtml(sb.book.title)}</td>
      <td class="check">[ ]</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Session Sheet — ${session.session_id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; padding: 12mm; font-size: 11pt; color: #111; }
    h1 { font-size: 14pt; margin-bottom: 4mm; }
    hr { border: none; border-top: 1px solid #333; margin: 4mm 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 4mm; }
    th, td { text-align: left; padding: 2mm 1mm; border-bottom: 1px solid #ccc; vertical-align: top; }
    th { font-size: 9pt; text-transform: uppercase; letter-spacing: 0.5px; }
    .check { width: 18mm; text-align: center; }
    .meta { line-height: 1.6; }
    .footer { margin-top: 8mm; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <p class="no-print" style="margin-bottom: 6mm;">Print this sheet for field use.</p>
  <h1>BOOKBERRY — SESSION SHEET</h1>
  <hr />
  <div class="meta">
    <div><strong>School:</strong> ${escapeHtml(session.school.name)}</div>
    <div><strong>Date:</strong> ${session.date} &nbsp;|&nbsp; <strong>Class:</strong> ${escapeHtml(classLabel || "—")} &nbsp;|&nbsp; <strong>Students:</strong> ${session.approx_student_count ?? "—"}</div>
    <div><strong>Conducted by:</strong> ${escapeHtml(session.conducted_by ?? "Prema")}</div>
  </div>
  <hr />
  <table>
    <thead>
      <tr><th>No.</th><th>BBID</th><th>Title</th><th>Returned</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    <strong>Total Books:</strong> ${session.session_books.length} &nbsp;|&nbsp; <strong>Signature:</strong> ___________________
  </div>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
