import type { SupabaseClient } from "@supabase/supabase-js";
import type { LendingWithDetails } from "@/lib/supabase/types";
import { generateLendingId } from "@/lib/utils/lending-id";
import {
  calcDueDate,
  calcGraceUntil,
  todayISO,
} from "@/lib/utils/date";
import type { LendingCreateValues, LendingReturnValues } from "@/lib/validations/lending";
import { getMember } from "@/lib/services/members";

export type LendingListParams = {
  status?: string;
  member_id?: string;
};

export async function syncOverdueLoans(supabase: SupabaseClient) {
  const today = todayISO();

  const { error } = await supabase
    .from("lending_transactions")
    .update({ status: "Overdue" })
    .eq("status", "Active")
    .lt("due_date", today);

  if (error) throw error;
}

export async function listLending(
  supabase: SupabaseClient,
  params: LendingListParams = {}
) {
  await syncOverdueLoans(supabase);

  let query = supabase
    .from("lending_transactions")
    .select(
      `
      *,
      member:members ( id, member_id, name, parent_contact, status ),
      book:books ( id, bbid, title, author, status, stock )
    `
    )
    .order("borrow_date", { ascending: false });

  if (params.status) query = query.eq("status", params.status);
  if (params.member_id) query = query.eq("member_id", params.member_id);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as LendingWithDetails[];
}

export async function getLending(supabase: SupabaseClient, id: string) {
  await syncOverdueLoans(supabase);

  const { data, error } = await supabase
    .from("lending_transactions")
    .select(
      `
      *,
      member:members ( id, member_id, name, parent_contact, status ),
      book:books ( id, bbid, title, author, status, stock )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as LendingWithDetails;
}

async function countActiveLoans(supabase: SupabaseClient, memberId: string) {
  const { count, error } = await supabase
    .from("lending_transactions")
    .select("*", { count: "exact", head: true })
    .eq("member_id", memberId)
    .in("status", ["Active", "Overdue"]);

  if (error) throw error;
  return count ?? 0;
}

export async function createLending(
  supabase: SupabaseClient,
  payload: LendingCreateValues
) {
  const member = await getMember(supabase, payload.member_id);
  const today = todayISO();

  if (member.status !== "Active") {
    throw new Error("Member is not active");
  }

  if (member.membership_end < today) {
    throw new Error("Membership has expired");
  }

  const activeCount = await countActiveLoans(supabase, member.id);
  if (activeCount >= member.max_books_quota) {
    throw new Error("Return a book first to borrow another");
  }

  const { data: book, error: bookError } = await supabase
    .from("books")
    .select("*")
    .eq("id", payload.book_id)
    .single();

  if (bookError) throw bookError;

  if (book.status !== "Available" || book.stock <= 0) {
    throw new Error("Book is not available — add to waitlist");
  }

  const borrow_date = payload.borrow_date ?? today;
  const due_date = calcDueDate(borrow_date, book.rental_validity);
  const grace_until = calcGraceUntil(due_date);
  const transaction_id = await generateLendingId(supabase);

  const { data: lending, error: lendError } = await supabase
    .from("lending_transactions")
    .insert({
      transaction_id,
      member_id: member.id,
      book_id: book.id,
      borrow_date,
      due_date,
      grace_until,
      condition_on_borrow: payload.condition_on_borrow,
      status: "Active",
    })
    .select()
    .single();

  if (lendError) throw lendError;

  const newStock = book.stock - 1;
  const { error: updateError } = await supabase
    .from("books")
    .update({
      stock: newStock,
      status: newStock <= 0 ? "Out - Member" : book.status,
    })
    .eq("id", book.id);

  if (updateError) throw updateError;

  return getLending(supabase, lending.id);
}

export async function returnLending(
  supabase: SupabaseClient,
  id: string,
  payload: LendingReturnValues
) {
  const lending = await getLending(supabase, id);

  if (lending.status === "Returned" || lending.status === "Lost") {
    throw new Error("Transaction already closed");
  }

  const today = todayISO();

  const { error: txError } = await supabase
    .from("lending_transactions")
    .update({
      return_date: today,
      status: "Returned",
      condition_on_return: payload.condition_on_return,
      damage_note: payload.damage_note ?? null,
    })
    .eq("id", id);

  if (txError) throw txError;

  const { data: book, error: bookError } = await supabase
    .from("books")
    .select("*")
    .eq("id", lending.book_id)
    .single();

  if (bookError) throw bookError;

  const bookUpdate: Record<string, unknown> = {
    stock: book.stock + 1,
  };

  if (payload.condition_on_return === "Damaged") {
    bookUpdate.condition = "Damaged";
    await supabase.from("damage_log").insert({
      book_id: book.id,
      member_id: lending.member_id,
      event_type: "Damaged",
      description: payload.damage_note ?? "Damaged on return",
    });
  }

  const { count: activeForBook } = await supabase
    .from("lending_transactions")
    .select("*", { count: "exact", head: true })
    .eq("book_id", book.id)
    .in("status", ["Active", "Overdue"]);

  if ((activeForBook ?? 0) === 0) {
    bookUpdate.status = "Available";
  }

  await supabase.from("books").update(bookUpdate).eq("id", book.id);

  if (book.stock === 0) {
    const { data: waitlistEntry } = await supabase
      .from("waitlist")
      .select("*")
      .eq("book_id", book.id)
      .eq("notified", false)
      .order("added_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (waitlistEntry) {
      await supabase
        .from("waitlist")
        .update({ notified: true })
        .eq("id", waitlistEntry.id);
    }
  }

  return getLending(supabase, id);
}

export async function markLendingLost(supabase: SupabaseClient, id: string) {
  const lending = await getLending(supabase, id);

  if (lending.status === "Returned" || lending.status === "Lost") {
    throw new Error("Transaction already closed");
  }

  const today = todayISO();

  await supabase
    .from("lending_transactions")
    .update({ return_date: today, status: "Lost" })
    .eq("id", id);

  await supabase
    .from("books")
    .update({ status: "Missing" })
    .eq("id", lending.book_id);

  await supabase.from("damage_log").insert({
    book_id: lending.book_id,
    member_id: lending.member_id,
    event_type: "Lost",
    description: "Marked lost from lending",
  });

  return getLending(supabase, id);
}

export async function getOverdueLending(supabase: SupabaseClient) {
  await syncOverdueLoans(supabase);
  return listLending(supabase, { status: "Overdue" });
}

export async function getOverdueCount(supabase: SupabaseClient) {
  await syncOverdueLoans(supabase);
  const { count, error } = await supabase
    .from("lending_transactions")
    .select("*", { count: "exact", head: true })
    .eq("status", "Overdue");

  if (error) throw error;
  return count ?? 0;
}

export async function getBooksOutMembersCount(supabase: SupabaseClient) {
  const { count, error } = await supabase
    .from("books")
    .select("*", { count: "exact", head: true })
    .eq("status", "Out - Member");

  if (error) throw error;
  return count ?? 0;
}

export async function addToWaitlist(
  supabase: SupabaseClient,
  payload: {
    book_id: string;
    member_id?: string | null;
    name?: string | null;
    contact?: string | null;
  }
) {
  const { data, error } = await supabase
    .from("waitlist")
    .insert({
      book_id: payload.book_id,
      member_id: payload.member_id ?? null,
      name: payload.name ?? null,
      contact: payload.contact ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFromWaitlist(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("waitlist").delete().eq("id", id);
  if (error) throw error;
}
