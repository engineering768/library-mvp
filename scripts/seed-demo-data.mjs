/**
 * Fill every BookBerry table with realistic demo data (idempotent).
 * Usage: node scripts/seed-demo-data.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function monthStartISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key);
const today = todayISO();
const year = new Date().getFullYear();

async function upsertByKey(table, keyCol, keyVal, row) {
  const { data: existing } = await supabase.from(table).select("id").eq(keyCol, keyVal).maybeSingle();
  if (existing) {
    const { data, error } = await supabase.from(table).update(row).eq("id", existing.id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from(table).insert({ ...row, [keyCol]: keyVal }).select().single();
  if (error) throw error;
  return data;
}

async function count(table) {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

async function seedSchools() {
  const schools = [
    {
      school_id: "SCH-MUN-001",
      name: "Shivaji Nagar Municipal School",
      type: "Municipal",
      area: "Shivaji Nagar",
      ward: "Ward 12",
      contact_person: "Smt. Patil",
      contact_number: "9876543210",
      medium: "Marathi",
      std_range: "1–7",
      active: true,
    },
    {
      school_id: "SCH-PVT-001",
      name: "Sunshine Academy",
      type: "Private",
      area: "Kothrud",
      ward: "Ward 5",
      contact_person: "Mr. Sharma",
      contact_number: "9123456780",
      medium: "English",
      std_range: "Nursery–8",
      active: true,
    },
  ];

  const out = [];
  for (const s of schools) {
    out.push(await upsertByKey("schools", "school_id", s.school_id, s));
  }

  await supabase.from("school_id_sequence").upsert([
    { type: "Municipal", last_seq: 1 },
    { type: "Private", last_seq: 1 },
  ]);

  console.log(`Schools: ${out.length} ready`);
  return out;
}

async function seedMembers() {
  const members = [
    {
      member_id: `MEM-${year}-0001`,
      name: "Arjun Patil",
      age: 9,
      school_name: "Shivaji Nagar Municipal School",
      standard: "4",
      medium: "Marathi",
      parent_name: "Rajesh Patil",
      parent_contact: "9811111101",
      membership_type: "Monthly",
      membership_start: addDays(today, -20),
      membership_end: addDays(today, 10),
      deposit_amount: 500,
      max_books_quota: 2,
      status: "Active",
    },
    {
      member_id: `MEM-${year}-0002`,
      name: "Priya Deshmukh",
      age: 11,
      school_name: "Sunshine Academy",
      standard: "6",
      medium: "English",
      parent_name: "Anita Deshmukh",
      parent_contact: "9822222202",
      membership_type: "Quarterly",
      membership_start: addDays(today, -85),
      membership_end: addDays(today, 5),
      deposit_amount: 500,
      max_books_quota: 2,
      status: "Active",
    },
    {
      member_id: `MEM-${year}-0003`,
      name: "Rohan Mehta",
      age: 7,
      school_name: "Sunshine Academy",
      standard: "2",
      medium: "English",
      parent_name: "Vikram Mehta",
      parent_contact: "9833333303",
      membership_type: "Annual",
      membership_start: addDays(today, -30),
      membership_end: addDays(today, 335),
      deposit_amount: 1000,
      max_books_quota: 3,
      status: "Active",
    },
    {
      member_id: `MEM-${year}-0004`,
      name: "Sneha Kulkarni",
      age: 10,
      school_name: "Shivaji Nagar Municipal School",
      standard: "5",
      medium: "Marathi",
      parent_name: "Suresh Kulkarni",
      parent_contact: "9844444404",
      membership_type: "Monthly",
      membership_start: addDays(today, -60),
      membership_end: addDays(today, -5),
      deposit_amount: 500,
      max_books_quota: 2,
      status: "Expired",
    },
    {
      member_id: `MEM-${year}-0005`,
      name: "Aanya Joshi",
      age: 6,
      school_name: "Sunshine Academy",
      standard: "1",
      medium: "English",
      parent_name: "Meera Joshi",
      parent_contact: "9855555505",
      membership_type: "Free",
      membership_start: addDays(today, -10),
      membership_end: addDays(today, 20),
      deposit_amount: 0,
      max_books_quota: 1,
      status: "Active",
    },
  ];

  const out = [];
  for (const m of members) {
    out.push(await upsertByKey("members", "member_id", m.member_id, m));
  }

  await supabase.from("member_id_sequence").upsert({ year, last_seq: 5 });
  console.log(`Members: ${out.length} ready`);
  return out;
}

async function seedExtraBooks() {
  const extras = [
    {
      bbid: `BB-${year}-0007`,
      title: "The Very Hungry Caterpillar",
      author: "Eric Carle",
      publisher: "Penguin",
      year: 2019,
      language: "English",
      age_group: "3 to 6",
      genre_1: "Picture Book",
      format: "Board Book",
      status: "Missing",
      condition: "Good",
      stock: 0,
      total_copies: 1,
    },
    {
      bbid: `BB-${year}-0008`,
      title: "Gajapati Kulapati",
      author: "Ashok Rajagopalan",
      publisher: "Tulika",
      year: 2021,
      language: "English",
      age_group: "3 to 6",
      genre_1: "Humour",
      format: "Paperback",
      status: "Damaged",
      condition: "Damaged",
      stock: 0,
      total_copies: 1,
    },
  ];

  for (const b of extras) {
    await upsertByKey("books", "bbid", b.bbid, b);
  }

  await supabase
    .from("bbid_sequence")
    .upsert({ year, last_seq: 8 }, { onConflict: "year" });

  console.log("Extra books: missing + damaged added");
}

async function seedSessions(schools) {
  const mun = schools.find((s) => s.school_id === "SCH-MUN-001");
  const pvt = schools.find((s) => s.school_id === "SCH-PVT-001");
  if (!mun || !pvt) return;

  const dateKey = today.replace(/-/g, "");
  const completedDate = addDays(today, -7);

  const sessions = [
    {
      session_id: `SES-${dateKey}-001`,
      school_id: mun.id,
      date: today,
      class_grade: "4",
      division: "A",
      approx_student_count: 32,
      conducted_by: "Prema",
      notes: "Weekly reading session",
      status: "Active",
    },
    {
      session_id: `SES-${completedDate.replace(/-/g, "")}-001`,
      school_id: pvt.id,
      date: completedDate,
      class_grade: "3",
      division: "B",
      approx_student_count: 24,
      conducted_by: "Prema",
      notes: "Completed — all books returned",
      status: "Completed",
    },
  ];

  const out = [];
  for (const s of sessions) {
    out.push(await upsertByKey("sessions", "session_id", s.session_id, s));
  }

  await supabase.from("session_id_sequence").upsert([
    { date_key: dateKey, last_seq: 1 },
    { date_key: completedDate.replace(/-/g, ""), last_seq: 1 },
  ]);

  console.log(`Sessions: ${out.length} ready`);
  return out;
}

async function seedSessionBooks(sessions) {
  const { data: books } = await supabase.from("books").select("id, bbid, title, status").order("bbid");
  if (!books?.length) return;

  const activeSession = sessions.find((s) => s.status === "Active");
  if (!activeSession) return;

  const sessionBooks = books
    .filter((b) => b.status === "Out - Session" || ["BB-2026-0001", "BB-2026-0002", "BB-2026-0003"].includes(b.bbid))
    .slice(0, 5);

  for (const book of sessionBooks) {
    const { data: existing } = await supabase
      .from("session_books")
      .select("id")
      .eq("session_id", activeSession.id)
      .eq("book_id", book.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from("session_books").insert({
        session_id: activeSession.id,
        book_id: book.id,
        carried: true,
        returned: null,
      });
    }

    if (book.status !== "Out - Session") {
      await supabase.from("books").update({ status: "Out - Session", stock: 0 }).eq("id", book.id);
    }
  }

  console.log("Session books linked to active session");
}

async function seedLending(members) {
  const active = members.filter((m) => m.status === "Active");
  const arjun = active.find((m) => m.member_id.endsWith("0001"));
  const priya = active.find((m) => m.member_id.endsWith("0002"));
  const rohan = active.find((m) => m.member_id.endsWith("0003"));

  const { data: books } = await supabase
    .from("books")
    .select("id, bbid, title, status, stock, rental_validity")
    .eq("status", "Available")
    .gt("stock", 0);

  const lendings = [];

  const { data: longRoad } = await supabase
    .from("books")
    .select("id, bbid, title, status, stock, rental_validity")
    .eq("title", "A Long Road on a Short Day")
    .maybeSingle();

  const availableBook = books?.[0] ?? (longRoad?.status === "Available" ? longRoad : null);

  if (arjun && availableBook) {
    lendings.push({
      transaction_id: `LND-${year}-00001`,
      member_id: arjun.id,
      book_id: availableBook.id,
      borrow_date: addDays(today, -5),
      due_date: addDays(today, 9),
      grace_until: addDays(today, 16),
      status: "Active",
      condition_on_borrow: "Good",
      bookUpdate: { status: "Out - Member", stock: 0 },
    });
  }

  const { data: flotsam } = await supabase
    .from("books")
    .select("id")
    .eq("title", "Flotsam")
    .maybeSingle();

  if (priya && flotsam) {
    lendings.push({
      transaction_id: `LND-${year}-00002`,
      member_id: priya.id,
      book_id: flotsam.id,
      borrow_date: addDays(today, -20),
      due_date: addDays(today, -3),
      grace_until: addDays(today, 4),
      status: "Overdue",
      condition_on_borrow: "Good",
      bookUpdate: { status: "Out - Member", stock: 0 },
    });
  }

  if (rohan) {
    const { data: exclamation } = await supabase
      .from("books")
      .select("id")
      .eq("title", "Exclamation Mark")
      .maybeSingle();

    const { data: ladyTarzan } = await supabase
      .from("books")
      .select("id")
      .eq("title", "Lady Tarzan")
      .maybeSingle();

    const returnedBook = exclamation ?? ladyTarzan;

    if (returnedBook) {
      lendings.push({
        transaction_id: `LND-${year}-00003`,
        member_id: rohan.id,
        book_id: returnedBook.id,
        borrow_date: addDays(today, -30),
        due_date: addDays(today, -16),
        return_date: addDays(today, -14),
        grace_until: addDays(today, -9),
        status: "Returned",
        condition_on_borrow: "Good",
        condition_on_return: "Good",
        bookUpdate: null,
      });
    }
  }

  for (const l of lendings) {
    const { bookUpdate, ...row } = l;
    await upsertByKey("lending_transactions", "transaction_id", row.transaction_id, row);
    if (bookUpdate) {
      await supabase.from("books").update(bookUpdate).eq("id", row.book_id);
    }
  }

  await supabase.from("lending_id_sequence").upsert({ year, last_seq: 3 });
  console.log(`Lending: ${lendings.length} transactions`);
}

async function seedWaitlist() {
  const { data: outBook } = await supabase
    .from("books")
    .select("id, title")
    .in("status", ["Out - Member", "Out - Session"])
    .limit(1)
    .maybeSingle();

  if (!outBook) return;

  const entries = [
    { book_id: outBook.id, name: "Kavita Shinde", contact: "9866666601", notify_method: "whatsapp" },
    { book_id: outBook.id, name: "Rahul Gore", contact: "9877777702", notify_method: "whatsapp" },
  ];

  for (const e of entries) {
    const { data: existing } = await supabase
      .from("waitlist")
      .select("id")
      .eq("book_id", e.book_id)
      .eq("contact", e.contact)
      .maybeSingle();

    if (!existing) {
      await supabase.from("waitlist").insert(e);
    }
  }

  console.log("Waitlist: entries added");
}

async function seedDamageLog(members) {
  const { data: damagedBook } = await supabase
    .from("books")
    .select("id")
    .eq("status", "Damaged")
    .maybeSingle();

  const member = members[0];
  if (!damagedBook) return;

  const { count: existing } = await supabase
    .from("damage_log")
    .select("*", { count: "exact", head: true });

  if ((existing ?? 0) > 0) return;

  await supabase.from("damage_log").insert([
    {
      book_id: damagedBook.id,
      member_id: member?.id ?? null,
      event_type: "Damaged",
      description: "Torn page on return — member lending",
    },
    {
      book_id: damagedBook.id,
      event_type: "Noted",
      description: "Marked damaged during catalog review",
    },
  ]);

  console.log("Damage log: entries added");
}

async function seedEvents() {
  const events = [
    {
      title: "Saturday Story Circle",
      description: "Open story reading for ages 4–10. Marathi and English books.",
      date: new Date(addDays(today, 10) + "T10:30:00").toISOString(),
      venue: "BookBerry Library, Kothrud",
      max_capacity: 25,
      registration_open: true,
      status: "Upcoming",
    },
    {
      title: "Summer Reading Camp",
      description: "Week-long reading camp with activities and author visit.",
      date: new Date(addDays(today, 21) + "T09:00:00").toISOString(),
      venue: "Sunshine Academy Hall",
      max_capacity: 40,
      registration_open: true,
      status: "Upcoming",
    },
  ];

  const out = [];
  for (const e of events) {
    const { data: existing } = await supabase.from("events").select("id").eq("title", e.title).maybeSingle();
    if (existing) {
      out.push(existing);
    } else {
      const { data, error } = await supabase.from("events").insert(e).select().single();
      if (error) throw error;
      out.push(data);
    }
  }

  const rsvps = [
    { event_id: out[0].id, name: "Meera Joshi", contact: "9855555505", email: "meera@example.com" },
    { event_id: out[0].id, name: "Sanjay Pawar", contact: "9888888801" },
    { event_id: out[0].id, name: "Divya Nair", contact: "9899999902", email: "divya@example.com" },
    { event_id: out[0].id, name: "Amit Shah", contact: "9800000003" },
    { event_id: out[1].id, name: "Rajesh Patil", contact: "9811111101" },
    { event_id: out[1].id, name: "Anita Deshmukh", contact: "9822222202" },
    { event_id: out[1].id, name: "Vikram Mehta", contact: "9833333303" },
    { event_id: out[1].id, name: "Neha Gupta", contact: "9812345678" },
    { event_id: out[1].id, name: "Pooja Kale", contact: "9823456789" },
  ];

  for (const r of rsvps) {
    const { data: existing } = await supabase
      .from("event_rsvps")
      .select("id")
      .eq("event_id", r.event_id)
      .eq("contact", r.contact)
      .maybeSingle();

    if (!existing) await supabase.from("event_rsvps").insert(r);
  }

  console.log(`Events: ${out.length} with RSVPs`);
  return out;
}

async function seedPayments(members, plans) {
  const monthly = plans.find((p) => p.type === "Monthly");
  const quarterly = plans.find((p) => p.type === "Quarterly");
  const arjun = members.find((m) => m.member_id.endsWith("0001"));
  const priya = members.find((m) => m.member_id.endsWith("0002"));

  const payments = [
    {
      razorpay_order_id: "order_demo_001",
      razorpay_payment_id: "pay_demo_001",
      member_id: arjun?.id,
      plan_id: monthly?.id,
      amount: 500,
      status: "paid",
      created_at: new Date(monthStartISO() + "T10:00:00").toISOString(),
    },
    {
      razorpay_order_id: "order_demo_002",
      razorpay_payment_id: "pay_demo_002",
      member_id: priya?.id,
      plan_id: quarterly?.id,
      amount: 1200,
      status: "paid",
      created_at: new Date(addDays(monthStartISO(), 5) + "T14:30:00").toISOString(),
    },
    {
      razorpay_order_id: "order_demo_003",
      member_id: arjun?.id,
      plan_id: monthly?.id,
      amount: 500,
      status: "created",
    },
  ];

  for (const p of payments) {
    if (p.razorpay_order_id) {
      await upsertByKey("payment_log", "razorpay_order_id", p.razorpay_order_id, p);
    }
  }

  console.log("Payments: MTD revenue seeded");
}

async function seedInviteCodes(plans) {
  const freePlan = plans.find((p) => p.is_free);
  if (!freePlan) return;

  await upsertByKey("invite_codes", "code", "PRERNA2026", {
    plan_id: freePlan.id,
    uses_max: 10,
    uses_count: 2,
    expires_at: addDays(today, 25) + "T23:59:59",
  });

  await upsertByKey("invite_codes", "code", "WELCOME30", {
    plan_id: freePlan.id,
    uses_max: 5,
    uses_count: 0,
    expires_at: addDays(today, 5) + "T23:59:59",
  });

  console.log("Invite codes: added");
}

async function seedBlogs() {
  const samples = [
    {
      slug: "brendan-wenzel-wizard-of-perspectives",
      title_en: "Brendan Wenzel: The Wizard of Perspectives",
      title_mr: null,
      type: "On Author/Book",
      linked_author: "Brendan Wenzel",
      contentFile: "brendan-wenzel-wizard-of-perspectives.txt",
      linkedBookTitles: [],
    },
    {
      slug: "bhetayla-havit-ashi-pustake",
      title_en: null,
      title_mr: "भेटायला हवीत अशी पुस्तके",
      type: "भेटायला",
      linked_author: null,
      contentFile: "bhetayla-havit-ashi-pustake.txt",
      linkedBookTitles: ["Flotsam", "A Long Road on a Short Day"],
    },
  ];

  for (const sample of samples) {
    const content = fs.readFileSync(path.join(root, "content", "blogs", sample.contentFile), "utf8");
    const { data: linked } = await supabase.from("books").select("id").in("title", sample.linkedBookTitles);

    await upsertByKey("blogs", "slug", sample.slug, {
      title_en: sample.title_en,
      title_mr: sample.title_mr,
      type: sample.type,
      external_url: null,
      content,
      linked_author: sample.linked_author,
      linked_books: (linked ?? []).map((b) => b.id),
      published: true,
    });
  }

  console.log("Blogs: 2 published articles");
}

async function main() {
  console.log("Seeding BookBerry demo data...\n");

  const { data: plans } = await supabase.from("subscription_plans").select("*");
  if (!plans?.length) {
    console.error("Run migration 005 first (subscription_plans missing)");
    process.exit(1);
  }

  const schools = await seedSchools();
  const members = await seedMembers();
  await seedExtraBooks();
  const sessions = await seedSessions(schools);
  await seedSessionBooks(sessions);
  await seedLending(members);
  await seedWaitlist();
  await seedDamageLog(members);
  await seedEvents();
  await seedPayments(members, plans);
  await seedInviteCodes(plans);
  await seedBlogs();

  console.log("\nDone! Refresh /admin/dashboard");
  console.log("Tables filled: schools, members, books, sessions, session_books,");
  console.log("lending, waitlist, damage_log, events, event_rsvps, payment_log,");
  console.log("invite_codes, blogs (+ subscription_plans from migration 005)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
