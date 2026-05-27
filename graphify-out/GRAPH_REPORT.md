# Graph Report - bookberry  (2026-05-27)

## Corpus Check
- 195 files · ~44,419 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 710 nodes · 1905 edges · 40 communities (24 shown, 16 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `61b7334d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 37|Community 37]]

## God Nodes (most connected - your core abstractions)
1. `requireAuth()` - 78 edges
2. `cn()` - 77 edges
3. `LinkButton()` - 32 edges
4. `Button()` - 24 edges
5. `Skeleton()` - 19 edges
6. `GET()` - 18 edges
7. `Badge()` - 18 edges
8. `Input()` - 18 edges
9. `Card()` - 17 edges
10. `CardHeader()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `requireAuth()`  [INFERRED]
  app/api/public/blogs/route.ts → lib/api-auth.ts
- `GET()` --calls--> `getBook()`  [INFERRED]
  app/api/sessions/[id]/route.ts → lib/services/books.ts
- `GET()` --calls--> `getLending()`  [INFERRED]
  app/api/sessions/[id]/route.ts → lib/services/lending.ts
- `GET()` --calls--> `getMemberProfile()`  [INFERRED]
  app/api/sessions/[id]/route.ts → lib/services/members.ts
- `GET()` --calls--> `getSchoolWithSessions()`  [INFERRED]
  app/api/sessions/[id]/route.ts → lib/services/schools.ts

## Communities (40 total, 16 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (63): POST(), RouteContext, POST(), RouteContext, DELETE(), GET(), POST(), requireAuth() (+55 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (54): BlogForm(), GET(), POST(), GET(), EditBlogPage(), PageProps, GET(), POST() (+46 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (39): AdminTopBar(), BLOG_TYPES, BlogFormProps, BookOption, AGE_GROUPS, BookForm(), BookFormProps, CONDITIONS (+31 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (36): PATCH(), POST(), BOOK_UPLOAD_FIELD_MAP, BookUploadRow, bookUploadRowToPayload(), cleanValue(), EMPTY_VALUES, isEmptyUploadRow() (+28 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (36): SessionDetailClient(), SessionDetailClientProps, cn(), SessionDetail, CardAction(), CardFooter(), Dialog(), DialogContent() (+28 more)

### Community 5 - "Community 5"
Cohesion: 0.1
Nodes (35): GET(), RouteContext, EditMemberPage(), GET(), POST(), GET(), getAdminOverview(), getDashboardStats() (+27 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (15): BookLocateClient(), ImportPageClient(), LendingReturnClientProps, StatusBadge(), PageProps, BlogsPageClient(), CataloguePageClient(), PublicBook (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (26): MemberForm(), POST(), RouteContext, POST(), GET(), POST(), POST(), createPaymentOrder() (+18 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (23): LendingStatusBadge(), styles, MemberDetailClient(), MemberDetailClientProps, MemberStatusBadge(), styles, AdminOverview, Blog (+15 more)

### Community 9 - "Community 9"
Cohesion: 0.26
Nodes (13): EventDetailClientProps, EventRow, InviteRow, PlansPageClient(), SchoolsPageClient(), SessionRow, Skeleton(), Table() (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (21): addDays(), __dirname, main(), monthStartISO(), root, seedBlogs(), seedDamageLog(), seedEvents() (+13 more)

### Community 11 - "Community 11"
Cohesion: 0.16
Nodes (18): SchoolDetailPage(), GET(), POST(), createSchool(), deactivateSchool(), emptyToNull(), getSchool(), getSchoolWithSessions() (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (17): AttentionPanel(), BOOK_COLORS, bookSegmentsFromCharts(), DonutChart(), DonutSegment, KpiStrip(), MonthlyTrendChart(), OperationsBarChart() (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.14
Nodes (12): SessionStatusBadge(), styles, statusStyles, BlogDetailClientProps, PublicBlog, PublicBook, PublicEvent, PublicPlan (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (17): 1. Install dependencies, 2. Configure Supabase, 3. Run locally, BookBerry MVP, code:bash (cd bookberry), code:bash (npm run dev), code:block3 (bookberry/), Deploy (+9 more)

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (4): EventForm(), LinkButton(), LinkButtonProps, linkButtonVariants

### Community 16 - "Community 16"
Cohesion: 0.36
Nodes (8): clean(), __dirname, generateBBID(), loadEnv(), main(), mapRow(), normalizeFormat(), root

### Community 17 - "Community 17"
Cohesion: 0.29
Nodes (6): bookIdsForTitles(), __dirname, main(), root, SAMPLES, supabase

### Community 18 - "Community 18"
Cohesion: 0.4
Nodes (3): geistMono, geistSans, metadata

### Community 19 - "Community 19"
Cohesion: 0.4
Nodes (3): LendingReturnClient(), PageProps, daysUntil()

## Knowledge Gaps
- **111 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `config`, `geistSans` (+106 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 4` to `Community 2`, `Community 6`, `Community 8`, `Community 9`, `Community 12`, `Community 13`, `Community 15`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `requireAuth()` connect `Community 0` to `Community 1`, `Community 3`, `Community 5`, `Community 7`, `Community 11`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `addDaysToDate()` connect `Community 7` to `Community 0`, `Community 10`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `requireAuth()` (e.g. with `GET()` and `GET()`) actually correct?**
  _`requireAuth()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _111 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._