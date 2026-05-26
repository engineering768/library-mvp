-- BookBerry: blog content column + sample blog posts from Prerna docx samples
-- Run after 005_phase3.sql

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE blogs ALTER COLUMN external_url DROP NOT NULL;

-- Books referenced in the Marathi blog (skip if already present)
INSERT INTO books (
  bbid, catalog_sr_no, title, author, illustrator, publisher, year,
  language, age_group, format, status, condition, stock, total_copies, rental_validity
)
SELECT v.* FROM (VALUES
  (
    'BB-2026-0005', 5, 'Flotsam', 'David Wiesner', 'David Wiesner', 'Clarion Books', 2006,
    'English', '5 to 10', 'Hardcover'::book_format, 'Available'::book_status,
    'Good'::book_condition, 1, 1, 14
  ),
  (
    'BB-2026-0006', 6, 'A Long Road on a Short Day', 'Gary D. Schmidt', 'Eugene Yelchin',
    'Clarion Books', 2020,
    'English', '5 to 10', 'Hardcover'::book_format, 'Available'::book_status,
    'Good'::book_condition, 1, 1, 14
  )
) AS v(
  bbid, catalog_sr_no, title, author, illustrator, publisher, year,
  language, age_group, format, status, condition, stock, total_copies, rental_validity
)
WHERE NOT EXISTS (
  SELECT 1 FROM books b WHERE lower(b.title) = lower(v.title)
);

INSERT INTO bbid_sequence (year, last_seq)
VALUES (2026, 6)
ON CONFLICT (year) DO UPDATE SET last_seq = GREATEST(bbid_sequence.last_seq, 6);

-- Seed blogs via script after this migration, OR run: node scripts/seed-sample-blogs.mjs
