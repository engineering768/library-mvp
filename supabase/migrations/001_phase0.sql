-- BookBerry Phase 0: Books catalog + BBID sequence

CREATE TYPE book_condition AS ENUM ('Good', 'Worn', 'Damaged');
CREATE TYPE book_status AS ENUM (
  'Available',
  'Out - Session',
  'Out - Member',
  'Missing',
  'Damaged',
  'Retired'
);
CREATE TYPE book_format AS ENUM ('Paperback', 'Hardcover', 'Wordless', 'Board Book');

CREATE TABLE books (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bbid            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  author          TEXT,
  illustrator     TEXT,
  publisher       TEXT,
  year            INTEGER,
  language        TEXT,
  age_group       TEXT,
  genre_1         TEXT,
  genre_2         TEXT,
  genre_3         TEXT,
  theme           TEXT,
  awards          TEXT,
  format          book_format DEFAULT 'Paperback',
  isbn            TEXT,
  condition       book_condition DEFAULT 'Good',
  status          book_status DEFAULT 'Available',
  physical_label  BOOLEAN DEFAULT FALSE,
  blog_link_en    TEXT,
  blog_link_mr    TEXT,
  activity_notes  TEXT,
  rental_validity INTEGER DEFAULT 14,
  stock           INTEGER DEFAULT 1,
  total_copies    INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bbid_sequence (
  year     INTEGER PRIMARY KEY,
  last_seq INTEGER DEFAULT 0
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION increment_bbid_sequence(p_year INTEGER)
RETURNS INTEGER AS $$
DECLARE next_seq INTEGER;
BEGIN
  INSERT INTO bbid_sequence (year, last_seq) VALUES (p_year, 1)
  ON CONFLICT (year) DO UPDATE SET last_seq = bbid_sequence.last_seq + 1
  RETURNING last_seq INTO next_seq;
  RETURN next_seq;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON books FOR ALL USING (true);

ALTER TABLE bbid_sequence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON bbid_sequence FOR ALL USING (true);
