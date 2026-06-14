/*
  # Create Translations Table for Admin Translation Console

  1. New Tables
    - `translations`
      - `id` (uuid, primary key)
      - `key` (text, unique, not null) - dot-notation translation key
      - `en` (text) - English value
      - `fr` (text) - French value
      - `es` (text) - Spanish value
      - `zh` (text) - Chinese Simplified value
      - `updated_at` (timestamptz)
      - `updated_by` (uuid, references auth.users)

  2. Security
    - RLS enabled
    - All authenticated users can read translations
    - Only admin users can insert/update/delete

  3. Indexes
    - Unique index on `key`
*/

CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  en text NOT NULL DEFAULT '',
  fr text NOT NULL DEFAULT '',
  es text NOT NULL DEFAULT '',
  zh text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON translations FROM anon;

CREATE POLICY "Authenticated users can read translations"
  ON translations FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert translations"
  ON translations FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update translations"
  ON translations FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete translations"
  ON translations FOR DELETE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(key);
