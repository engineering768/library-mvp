-- BookBerry Phase 2: Members + Lending

CREATE TYPE member_status AS ENUM ('Active', 'Expired', 'Suspended', 'Pending');
CREATE TYPE membership_type AS ENUM ('Monthly', 'Quarterly', 'Annual', 'Free');
CREATE TYPE lending_status AS ENUM ('Active', 'Returned', 'Overdue', 'Lost');

CREATE TABLE member_id_sequence (
  year     INTEGER PRIMARY KEY,
  last_seq INTEGER DEFAULT 0
);

CREATE TABLE lending_id_sequence (
  year     INTEGER PRIMARY KEY,
  last_seq INTEGER DEFAULT 0
);

CREATE TABLE members (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id          TEXT UNIQUE NOT NULL,
  name               TEXT NOT NULL,
  age                INTEGER,
  school_name        TEXT,
  standard           TEXT,
  medium             TEXT,
  gender             TEXT,
  parent_name        TEXT,
  parent_contact     TEXT NOT NULL,
  address            TEXT,
  membership_type    membership_type NOT NULL,
  membership_start   DATE NOT NULL,
  membership_end     DATE NOT NULL,
  deposit_amount     DECIMAL(10,2) DEFAULT 0,
  max_books_quota    INTEGER DEFAULT 2,
  status             member_status DEFAULT 'Active',
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lending_transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id      TEXT UNIQUE NOT NULL,
  member_id           UUID NOT NULL REFERENCES members(id),
  book_id             UUID NOT NULL REFERENCES books(id),
  borrow_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date            DATE NOT NULL,
  grace_until         DATE,
  return_date         DATE,
  status              lending_status DEFAULT 'Active',
  condition_on_borrow book_condition DEFAULT 'Good',
  condition_on_return book_condition,
  damage_note         TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE damage_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id         UUID NOT NULL REFERENCES books(id),
  member_id       UUID REFERENCES members(id),
  session_id      UUID REFERENCES sessions(id),
  event_type      TEXT NOT NULL,
  description     TEXT,
  logged_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE waitlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id     UUID NOT NULL REFERENCES books(id),
  member_id   UUID REFERENCES members(id),
  name        TEXT,
  contact     TEXT,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  notified    BOOLEAN DEFAULT FALSE,
  UNIQUE(book_id, member_id)
);

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER lending_updated_at
  BEFORE UPDATE ON lending_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION increment_member_id_sequence(p_year INTEGER)
RETURNS INTEGER AS $$
DECLARE next_seq INTEGER;
BEGIN
  INSERT INTO member_id_sequence (year, last_seq) VALUES (p_year, 1)
  ON CONFLICT (year) DO UPDATE SET last_seq = member_id_sequence.last_seq + 1
  RETURNING last_seq INTO next_seq;
  RETURN next_seq;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_lending_id_sequence(p_year INTEGER)
RETURNS INTEGER AS $$
DECLARE next_seq INTEGER;
BEGIN
  INSERT INTO lending_id_sequence (year, last_seq) VALUES (p_year, 1)
  ON CONFLICT (year) DO UPDATE SET last_seq = lending_id_sequence.last_seq + 1
  RETURNING last_seq INTO next_seq;
  RETURN next_seq;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE member_id_sequence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON member_id_sequence FOR ALL USING (true);

ALTER TABLE lending_id_sequence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON lending_id_sequence FOR ALL USING (true);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON members FOR ALL USING (true);

ALTER TABLE lending_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON lending_transactions FOR ALL USING (true);

ALTER TABLE damage_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON damage_log FOR ALL USING (true);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON waitlist FOR ALL USING (true);
