-- ═══════════════════════════════════════════════════════════
--  صفحة ذكرى محمد البحيري — Supabase Schema
--  نفّذ هذا الملف من: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- إحصائيات التلاوات
CREATE TABLE IF NOT EXISTS track_stats (
  track_id   TEXT PRIMARY KEY,
  plays      BIGINT NOT NULL DEFAULT 0,
  downloads  BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- سجل التعازي
CREATE TABLE IF NOT EXISTS condolences (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  message    TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 220),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved   BOOLEAN NOT NULL DEFAULT true
);

-- بذور أولية لمقاطع التلاوة
INSERT INTO track_stats (track_id, plays, downloads) VALUES
  ('anam',   0, 0),
  ('fatiha', 0, 0),
  ('ikhlas', 0, 0),
  ('falaq',  0, 0),
  ('nas',    0, 0),
  ('yasin',  0, 0)
ON CONFLICT (track_id) DO NOTHING;

-- دالة آمنة لزيادة العدادات
CREATE OR REPLACE FUNCTION increment_track_stat(p_track_id TEXT, p_event TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_event NOT IN ('play', 'download') THEN
    RAISE EXCEPTION 'invalid event: %', p_event;
  END IF;

  INSERT INTO track_stats (track_id, plays, downloads)
  VALUES (
    p_track_id,
    CASE WHEN p_event = 'play' THEN 1 ELSE 0 END,
    CASE WHEN p_event = 'download' THEN 1 ELSE 0 END
  )
  ON CONFLICT (track_id) DO UPDATE SET
    plays = track_stats.plays +
      CASE WHEN p_event = 'play' THEN 1 ELSE 0 END,
    downloads = track_stats.downloads +
      CASE WHEN p_event = 'download' THEN 1 ELSE 0 END,
    updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION increment_track_stat(TEXT, TEXT) TO anon, authenticated;

-- Row Level Security
ALTER TABLE track_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE condolences ENABLE ROW LEVEL SECURITY;

-- القراءة العامة للإحصائيات
CREATE POLICY "track_stats_select_public"
  ON track_stats FOR SELECT
  TO anon, authenticated
  USING (true);

-- التعازي: قراءة المعتمدة فقط
CREATE POLICY "condolences_select_approved"
  ON condolences FOR SELECT
  TO anon, authenticated
  USING (approved = true);

-- التعازي: إضافة من الزوار
CREATE POLICY "condolences_insert_public"
  ON condolences FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    approved = true
    AND char_length(name) BETWEEN 1 AND 80
    AND char_length(message) BETWEEN 1 AND 220
  );

-- فهرس للترتيب
CREATE INDEX IF NOT EXISTS condolences_created_at_idx
  ON condolences (created_at DESC);

-- ── خطوة يدوية ──
-- فعّل Realtime للتعازي من:
-- Database → Replication → condolences → Enable
