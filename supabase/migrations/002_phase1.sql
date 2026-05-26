-- BookBerry Phase 1: Schools + Sessions

CREATE TYPE school_type AS ENUM ('Municipal', 'Private');
CREATE TYPE session_status AS ENUM ('Planned', 'Active', 'Completed', 'Cancelled');

CREATE TABLE schools (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id      TEXT UNIQUE NOT NULL,
  name           TEXT NOT NULL,
  type           school_type NOT NULL,
  area           TEXT,
  ward           TEXT,
  contact_person TEXT,
  contact_number TEXT,
  medium         TEXT,
  std_range      TEXT,
  active         BOOLEAN DEFAULT TRUE,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE school_id_sequence (
  type     TEXT PRIMARY KEY,
  last_seq INTEGER DEFAULT 0
);

CREATE TABLE session_id_sequence (
  date_key TEXT PRIMARY KEY,
  last_seq INTEGER DEFAULT 0
);

CREATE TABLE sessions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            TEXT UNIQUE NOT NULL,
  school_id             UUID NOT NULL REFERENCES schools(id),
  date                  DATE NOT NULL,
  class_grade           TEXT,
  division              TEXT,
  approx_student_count  INTEGER,
  conducted_by          TEXT DEFAULT 'Prema',
  notes                 TEXT,
  status                session_status DEFAULT 'Planned',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE session_books (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  book_id         UUID NOT NULL REFERENCES books(id),
  carried         BOOLEAN DEFAULT TRUE,
  returned        BOOLEAN,
  condition_note  TEXT,
  returned_at     TIMESTAMPTZ,
  UNIQUE(session_id, book_id)
);

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION increment_school_id_sequence(p_type TEXT)
RETURNS INTEGER AS $$
DECLARE next_seq INTEGER;
BEGIN
  INSERT INTO school_id_sequence (type, last_seq) VALUES (p_type, 1)
  ON CONFLICT (type) DO UPDATE SET last_seq = school_id_sequence.last_seq + 1
  RETURNING last_seq INTO next_seq;
  RETURN next_seq;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_session_id_sequence(p_date_key TEXT)
RETURNS INTEGER AS $$
DECLARE next_seq INTEGER;
BEGIN
  INSERT INTO session_id_sequence (date_key, last_seq) VALUES (p_date_key, 1)
  ON CONFLICT (date_key) DO UPDATE SET last_seq = session_id_sequence.last_seq + 1
  RETURNING last_seq INTO next_seq;
  RETURN next_seq;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON schools FOR ALL USING (true);

ALTER TABLE school_id_sequence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON school_id_sequence FOR ALL USING (true);

ALTER TABLE session_id_sequence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON session_id_sequence FOR ALL USING (true);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON sessions FOR ALL USING (true);

ALTER TABLE session_books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON session_books FOR ALL USING (true);
