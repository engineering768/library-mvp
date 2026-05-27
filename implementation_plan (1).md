# Frontend UI Enhancements: Page Descriptions

This plan addresses the goal of adding short, professional, and easy-to-understand descriptions at the top of every major admin and public page to enhance client clarity during the MVP presentation.

## Open Questions

- None at the moment. The plan uses the existing typography (`text-sm text-muted-foreground` under an `h1`) which requires no new components or styles.

## Proposed Changes

We will modify the page headers by updating or adding a `<p className="text-sm text-muted-foreground mt-1">` element directly beneath the main `<h1>` or `<CardTitle>`, ensuring it's wrapped properly to maintain layout structure.

### Admin Dashboard & Main Views
- **Dashboard** (`components/admin/dashboard-client.tsx`): 
  "Your daily command centre — see how many members are active, which sessions are running today, which books are overdue, and what needs your attention right now."
- **Books** (`components/admin/books-page-client.tsx`): 
  "The full library catalogue — add new books, edit details, print BBID labels, and see at a glance which books are available, issued, or missing."
- **Members** (`components/admin/members-page-client.tsx`): 
  "All registered members in one place — view their active borrows, check membership status, print ID cards, and quickly spot overdue or suspended accounts."
- **Schools** (`components/admin/schools-page-client.tsx`): 
  "All partner schools listed here — add a new school, view their contact info, and see every reading session they've run along with its current status."
- **Sessions** (`components/admin/sessions-page-client.tsx`): 
  "Every school reading session from start to finish — see which books were issued, which have been returned, flag missing books, and close out the session when done."
- **Lending** (`components/admin/lending-page-client.tsx`): 
  "Issue books to members, record returns, and keep track of who has what. Overdue items and lending limits are automatically flagged so nothing slips through."
- **Events** (`components/admin/events-page-client.tsx`): 
  "Create and manage library events like reading camps and workshops — set the date, location, and details, then publish them to the public website for members to discover."
- **Blogs** (`components/admin/blogs-page-client.tsx`): 
  "Write and publish posts that appear on the public website — reading guides, book recommendations, library updates, or community stories. Draft here, publish when ready."
- **Plans** (`components/admin/plans-page-client.tsx`): 
  "Set up the membership tiers shown on your public page — define what each plan includes, how many books members can borrow, and the pricing for each tier."

### Admin Action Views
- **Book Locate** (`components/admin/book-locate-client.tsx`): 
  "Can't find a book? Search by its BBID or title to instantly see if it's on the shelf, issued to a member, out in a school session, or marked missing."
- **Import Books** (`components/admin/import-page-client.tsx`): 
  "Adding a large batch of books? Upload a CSV file to add them all at once instead of entering each one manually. A BBID label is automatically generated for every new book."
- **Add Book** (`app/admin/books/new/page.tsx`): 
  "Fill in the book's details to add it to the catalogue — a unique BBID label is generated automatically once saved."
- **Edit Book** (`app/admin/books/[id]/edit/page.tsx`): 
  "Update this book's details, availability status, or any other information in the catalogue."
- **Add Member** (`app/admin/members/new/page.tsx`): 
  "Registering a new member — fill in their details, choose their membership plan, and their unique member ID and printable ID card are generated automatically."
- **Edit Member** (`app/admin/members/[id]/edit/page.tsx`): 
  "Update this member's personal information, membership plan, or account status."
- **Add Blog** (`app/admin/blogs/new/page.tsx`): 
  "Draft a new blog post for the public website — write and preview here, then publish it when it's ready to go live."
- **Edit Blog** (`app/admin/blogs/[id]/edit/page.tsx`): 
  "Update the content, images, or visibility of this blog post. Changes go live as soon as you save and publish."
- **Add Event** (`app/admin/events/new/page.tsx`): 
  "Setting up a new event — add the title, date, time, and location so it appears on the public events page for members to see."
- **Add School** (`app/admin/schools/new/page.tsx`): 
  "Adding a partner school — once registered, you can create reading sessions for them and track all books sent to and returned from that school."
- **New Session** (`components/admin/session-new-client.tsx`): 
  "Starting a school visit? Open a new session for the school, scan or select the books being sent out, and activate it — the system will track these books until they're returned."
- **New Lending** (`components/admin/lending-new-client.tsx`): 
  "Issuing books to a member — search for the member, select the books, and confirm. Their borrowing quota updates automatically and the due date is set based on their plan."
- **Record Return** (`components/admin/lending-return-client.tsx`): 
  "Accepting books back? Mark them as returned here, note any damage if applicable, and the member's borrowing slot opens up automatically for their next borrow."

### Public Pages & Auth
- **Login** (`app/auth/login/page.tsx`): 
  "Sign in to access the admin dashboard and manage your library's catalogue, members, and daily operations."
- **Public Catalogue** (`components/public/catalogue-page-client.tsx`): 
  "Open to everyone — visitors can search and browse the full book collection and see which titles are currently available to borrow, no login needed."
- **Public Events** (`components/public/events-page-client.tsx`): 
  "All upcoming library events in one place — visitors can see what's on and find out how to join a reading camp, workshop, or community activity."
- **Public Membership** (`components/public/membership-page-client.tsx`): 
  "Shows prospective members the available plans — what each plan allows, how many books they can borrow at once, and how to sign up."
- **Public Blogs** (`components/public/blogs-page-client.tsx`): 
  "The library's public blog — readers can browse articles, book recommendations, and updates posted by the library team."

## Verification Plan

### Automated Tests
- I will run `npm run build` to verify no TypeScript compilation errors were introduced.

### Manual Verification
- I will review the modified files to ensure all routes and logic remain strictly untouched. Only typography and text will be adjusted.
