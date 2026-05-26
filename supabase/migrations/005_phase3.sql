-- BookBerry Phase 3: Public catalogue, blogs, events, plans, payments

CREATE TYPE event_status AS ENUM ('Upcoming', 'Ongoing', 'Completed', 'Cancelled');

CREATE TABLE subscription_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  type            membership_type NOT NULL,
  price           DECIMAL(10,2) NOT NULL DEFAULT 0,
  validity_days   INTEGER NOT NULL,
  max_books_quota INTEGER NOT NULL DEFAULT 2,
  is_free         BOOLEAN DEFAULT FALSE,
  active          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invite_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,
  plan_id     UUID REFERENCES subscription_plans(id),
  uses_max    INTEGER DEFAULT 1,
  uses_count  INTEGER DEFAULT 0,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE blogs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title_en     TEXT,
  title_mr     TEXT,
  type         TEXT NOT NULL,
  external_url TEXT NOT NULL,
  linked_books UUID[] DEFAULT '{}',
  linked_author TEXT,
  published    BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  description       TEXT,
  date              TIMESTAMPTZ NOT NULL,
  venue             TEXT,
  max_capacity      INTEGER,
  registration_open BOOLEAN DEFAULT TRUE,
  status            event_status DEFAULT 'Upcoming',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_rsvps (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  contact    TEXT NOT NULL,
  email      TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, contact)
);

CREATE TABLE payment_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,
  member_id           UUID REFERENCES members(id),
  plan_id             UUID REFERENCES subscription_plans(id),
  amount              DECIMAL(10,2),
  status              TEXT,
  webhook_payload     JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS notify_method TEXT DEFAULT 'whatsapp';

CREATE TRIGGER subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON subscription_plans FOR ALL USING (true);

ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON invite_codes FOR ALL USING (true);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published blogs" ON blogs FOR SELECT USING (published = true);
CREATE POLICY "Admin full access blogs" ON blogs FOR ALL USING (true);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read events" ON events FOR SELECT USING (status != 'Cancelled');
CREATE POLICY "Admin full access events" ON events FOR ALL USING (true);

ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access rsvps" ON event_rsvps FOR ALL USING (true);

ALTER TABLE payment_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access payments" ON payment_log FOR ALL USING (true);

-- Default subscription plans
INSERT INTO subscription_plans (name, type, price, validity_days, max_books_quota, is_free, active)
SELECT * FROM (VALUES
  ('Monthly', 'Monthly'::membership_type, 500.00, 30, 2, false, true),
  ('Quarterly', 'Quarterly'::membership_type, 1200.00, 90, 2, false, true),
  ('Annual', 'Annual'::membership_type, 4000.00, 365, 3, false, true),
  ('Free Trial', 'Free'::membership_type, 0.00, 30, 1, true, true)
) AS v(name, type, price, validity_days, max_books_quota, is_free, active)
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans LIMIT 1);
