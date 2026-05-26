export type BookCondition = "Good" | "Worn" | "Damaged";

export type BookStatus =
  | "Available"
  | "Out - Session"
  | "Out - Member"
  | "Missing"
  | "Damaged"
  | "Retired";

export type BookFormat = "Paperback" | "Hardcover" | "Wordless" | "Board Book";

export type Book = {
  id: string;
  bbid: string;
  title: string;
  author: string | null;
  illustrator: string | null;
  publisher: string | null;
  year: number | null;
  language: string | null;
  age_group: string | null;
  genre_1: string | null;
  genre_2: string | null;
  genre_3: string | null;
  theme: string | null;
  awards: string | null;
  format: BookFormat;
  isbn: string | null;
  condition: BookCondition;
  status: BookStatus;
  physical_label: boolean;
  blog_link_en: string | null;
  blog_link_mr: string | null;
  activity_notes: string | null;
  rental_validity: number;
  stock: number;
  total_copies: number;
  catalog_sr_no: number | null;
  sel: string | null;
  setting: string | null;
  recommendation: string | null;
  blog_language: string | null;
  additional_material: string | null;
  availability_notes: string | null;
  readers_review: string | null;
  parents_review: string | null;
  created_at: string;
  updated_at: string;
};

export type BookInsert = Omit<
  Book,
  "id" | "bbid" | "created_at" | "updated_at"
> & {
  bbid?: string;
};

export type DashboardStats = {
  total: number;
  available: number;
  out: number;
  damaged: number;
  lost: number;
  missing: number;
  todays_sessions: number;
  books_out_sessions: number;
  active_members: number;
  expired_members_month: number;
  overdue_count: number;
  books_out_members: number;
  revenue_mtd: number;
  upcoming_events: number;
  upcoming_event_rsvps: number;
};

export type EventStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";

export type Blog = {
  id: string;
  slug: string;
  title_en: string | null;
  title_mr: string | null;
  type: string;
  external_url: string | null;
  content: string | null;
  linked_books: string[];
  linked_author: string | null;
  published: boolean;
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  venue: string | null;
  max_capacity: number | null;
  registration_open: boolean;
  status: EventStatus;
  created_at: string;
};

export type EventRsvp = {
  id: string;
  event_id: string;
  name: string;
  contact: string;
  email: string | null;
  notes: string | null;
  created_at: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  type: MembershipType;
  price: number;
  validity_days: number;
  max_books_quota: number;
  is_free: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type InviteCode = {
  id: string;
  code: string;
  plan_id: string | null;
  uses_max: number;
  uses_count: number;
  expires_at: string | null;
  created_at: string;
};

export type AdminOverview = {
  active_subscribers: number;
  all_active_rentals: number;
  overdue_count: number;
  revenue_mtd: number;
  upcoming_event_rsvps: number;
  upcoming_events: number;
  recent_payments: unknown[];
};

export type MemberStatus = "Active" | "Expired" | "Suspended" | "Pending";
export type MembershipType = "Monthly" | "Quarterly" | "Annual" | "Free";
export type LendingStatus = "Active" | "Returned" | "Overdue" | "Lost";

export type Member = {
  id: string;
  member_id: string;
  name: string;
  age: number | null;
  school_name: string | null;
  standard: string | null;
  medium: string | null;
  gender: string | null;
  parent_name: string | null;
  parent_contact: string;
  address: string | null;
  membership_type: MembershipType;
  membership_start: string;
  membership_end: string;
  deposit_amount: number;
  max_books_quota: number;
  status: MemberStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type LendingTransaction = {
  id: string;
  transaction_id: string;
  member_id: string;
  book_id: string;
  borrow_date: string;
  due_date: string;
  grace_until: string | null;
  return_date: string | null;
  status: LendingStatus;
  condition_on_borrow: BookCondition;
  condition_on_return: BookCondition | null;
  damage_note: string | null;
  created_at: string;
  updated_at: string;
};

export type LendingWithDetails = LendingTransaction & {
  member: Pick<Member, "id" | "member_id" | "name" | "parent_contact" | "status">;
  book: Pick<Book, "id" | "bbid" | "title" | "author" | "status" | "stock">;
};

export type MemberProfile = Member & {
  active_loans: LendingWithDetails[];
  loan_history: LendingWithDetails[];
  damage_incidents: number;
  books_out: number;
  total_borrows: number;
};

export type ExpiringMember = Pick<
  Member,
  "id" | "member_id" | "name" | "membership_end" | "parent_contact"
>;

export type SchoolType = "Municipal" | "Private";

export type SessionStatus = "Planned" | "Active" | "Completed" | "Cancelled";

export type School = {
  id: string;
  school_id: string;
  name: string;
  type: SchoolType;
  area: string | null;
  ward: string | null;
  contact_person: string | null;
  contact_number: string | null;
  medium: string | null;
  std_range: string | null;
  active: boolean;
  notes: string | null;
  created_at: string;
};

export type Session = {
  id: string;
  session_id: string;
  school_id: string;
  date: string;
  class_grade: string | null;
  division: string | null;
  approx_student_count: number | null;
  conducted_by: string | null;
  notes: string | null;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
};

export type SessionBook = {
  id: string;
  session_id: string;
  book_id: string;
  carried: boolean;
  returned: boolean | null;
  condition_note: string | null;
  returned_at: string | null;
};

export type SessionBookWithBook = SessionBook & {
  book: Pick<Book, "id" | "bbid" | "title" | "author" | "status" | "condition">;
};

export type SessionWithSchool = Session & {
  school: Pick<School, "id" | "school_id" | "name" | "type">;
};

export type SessionDetail = SessionWithSchool & {
  session_books: SessionBookWithBook[];
};

export type BookLocation = {
  book: Pick<Book, "id" | "bbid" | "title" | "author" | "status">;
  current_session?: {
    session_id: string;
    school_name: string;
    date: string;
    status: SessionStatus;
  } | null;
  current_member?: {
    member_id: string;
    member_name: string;
    due_date: string;
    transaction_id: string;
  } | null;
  missing_from_session?: {
    session_id: string;
    school_name: string;
    date: string;
  } | null;
  last_seen?: string | null;
};
