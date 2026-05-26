-- BookBerry: columns for Prerna book_upload.csv + seed 4 catalog books
-- Run this entire file in Supabase SQL Editor

ALTER TABLE books ADD COLUMN IF NOT EXISTS catalog_sr_no INTEGER;
ALTER TABLE books ADD COLUMN IF NOT EXISTS sel TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS setting TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS recommendation TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS blog_language TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS additional_material TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS availability_notes TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS readers_review TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS parents_review TEXT;

-- Seed from book_upload.csv (skip if title already exists)
INSERT INTO books (
  bbid, catalog_sr_no, title, author, illustrator, publisher, year,
  language, age_group, format, awards, sel, theme, setting, recommendation,
  blog_language, status, condition, stock, total_copies, rental_validity
)
SELECT v.* FROM (VALUES
  (
    'BB-2026-0001', 1, 'My Mother''s Sari', 'Sandhy Rao', 'Nina Sabnani', 'Tulika', 2023,
    'English', '3 to 10', 'Paperback'::book_format, 'No', 'Yes', 'Imagination', 'India', 'Yes',
    'English', 'Available'::book_status, 'Good'::book_condition, 1, 1, 14
  ),
  (
    'BB-2026-0002', 2, 'Exclamation Mark', 'Amy Krouse Rosenthal', 'Tom Lichenheld',
    'New York Times Best Selling Team', 2013,
    'English', '3 to 10', 'Paperback'::book_format, 'No', 'Yes', 'Self-awareness', NULL, NULL,
    NULL, 'Available'::book_status, 'Good'::book_condition, 1, 1, 14
  ),
  (
    'BB-2026-0003', 3, 'Lady Tarzan', 'Lavanya Kartik', 'Rajiv Eipe', 'Jugnoo Publication', 2023,
    'English', '5 to 10', 'Paperback'::book_format, 'No', 'No', 'Conservation', 'India', NULL,
    NULL, 'Available'::book_status, 'Good'::book_condition, 1, 1, 14
  ),
  (
    'BB-2026-0004', 4, 'Kaisa Kaisa Khana', 'Prabhat', 'Elan Shaw', 'Jugnoo Publication', 2019,
    'Hindi', '3 to 6', 'Paperback'::book_format, 'No', 'No', 'Food', 'India', NULL,
    NULL, 'Available'::book_status, 'Good'::book_condition, 1, 1, 14
  )
) AS v(
  bbid, catalog_sr_no, title, author, illustrator, publisher, year,
  language, age_group, format, awards, sel, theme, setting, recommendation,
  blog_language, status, condition, stock, total_copies, rental_validity
)
WHERE NOT EXISTS (
  SELECT 1 FROM books b WHERE lower(b.title) = lower(v.title)
);

-- Keep BBID sequence in sync if seeds were inserted
INSERT INTO bbid_sequence (year, last_seq)
VALUES (2026, 4)
ON CONFLICT (year) DO UPDATE SET last_seq = GREATEST(bbid_sequence.last_seq, 4);
