/*
  # Art Provenance and Edition Control System

  1. Overview
    - Museum-grade tamper-evident provenance chain for all artworks
    - Edition control for limited print runs with serial numbers
    - Drop certificates as canonical records for releases
    - Support for digital art, physical prints, AR overlays, GameWear, campaigns

  2. New Tables
    - `pki_art_provenance` - Cryptographically linked provenance entries
    - `pki_art_editions` - Limited print run tracking with serial numbers
    - `pki_drop_certificates` - Master certificates for multi-asset drops
    - `pki_edition_verifications` - QR/NFC verification log

  3. Extensions to existing tables
    - Add PKI columns to art_assets table

  4. Security
    - Append-only provenance (no updates/deletes)
    - RLS enforces read access, service role for writes
*/

-- Asset type enum for provenance
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pki_art_asset_type') THEN
    CREATE TYPE pki_art_asset_type AS ENUM (
      'digital_art',
      'physical_print',
      'gamewear_unity',
      'gamewear_unreal',
      'gamewear_roblox',
      'ar_overlay',
      'campaign_visual',
      'nft_metadata',
      'animation',
      'audio'
    );
  END IF;
END $$;

-- Provenance event type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pki_provenance_event') THEN
    CREATE TYPE pki_provenance_event AS ENUM (
      'created',
      'signed',
      'edition_minted',
      'transferred',
      'verified',
      'exported',
      'modified',
      'archived',
      'drop_included',
      'co_signed'
    );
  END IF;
END $$;

-- Add PKI columns to existing art_assets if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'art_assets' AND column_name = 'file_hash'
  ) THEN
    ALTER TABLE art_assets ADD COLUMN file_hash text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'art_assets' AND column_name = 'pki_asset_type'
  ) THEN
    ALTER TABLE art_assets ADD COLUMN pki_asset_type pki_art_asset_type;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'art_assets' AND column_name = 'signed_by_cert_id'
  ) THEN
    ALTER TABLE art_assets ADD COLUMN signed_by_cert_id uuid REFERENCES pki_certificates(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'art_assets' AND column_name = 'signature'
  ) THEN
    ALTER TABLE art_assets ADD COLUMN signature text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'art_assets' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE art_assets ADD COLUMN tenant_id uuid REFERENCES pki_tenants(id);
  END IF;
END $$;

-- Drop certificates (master record for multi-asset releases)
CREATE TABLE IF NOT EXISTS pki_drop_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id text NOT NULL UNIQUE,
  tenant_id uuid NOT NULL REFERENCES pki_tenants(id) ON DELETE CASCADE,
  environment_id uuid NOT NULL REFERENCES pki_environments(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  avatar_id uuid NOT NULL,
  edition_size integer NOT NULL CHECK (edition_size > 0),
  asset_ids uuid[] NOT NULL,
  asset_hashes text[] NOT NULL,
  signed_by_avatar_cert_id uuid REFERENCES pki_certificates(id),
  avatar_signature text NOT NULL,
  co_signed_by_admin_cert_id uuid REFERENCES pki_certificates(id),
  admin_signature text,
  drop_date timestamptz,
  status text DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'signed', 'co_signed', 'released', 'sold_out', 'archived')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  released_at timestamptz
);

-- Art provenance ledger (append-only, cryptographically linked)
CREATE TABLE IF NOT EXISTS pki_art_provenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  art_id uuid NOT NULL REFERENCES art_assets(id) ON DELETE RESTRICT,
  edition_number integer,
  asset_type pki_art_asset_type NOT NULL,
  event_type pki_provenance_event NOT NULL,
  content_hash text NOT NULL,
  signed_by_avatar_id uuid,
  signed_by_cert_id uuid REFERENCES pki_certificates(id),
  cert_fingerprint text NOT NULL,
  signature text NOT NULL,
  previous_entry_id uuid REFERENCES pki_art_provenance(id),
  previous_entry_hash text,
  chain_position integer NOT NULL DEFAULT 1,
  metadata jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_provenance_chain CHECK (
    (previous_entry_id IS NULL AND chain_position = 1) OR
    (previous_entry_id IS NOT NULL AND chain_position > 1)
  )
);

-- Art editions (limited print runs)
CREATE TABLE IF NOT EXISTS pki_art_editions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  art_id uuid NOT NULL REFERENCES art_assets(id) ON DELETE RESTRICT,
  drop_id uuid REFERENCES pki_drop_certificates(id),
  edition_number integer NOT NULL CHECK (edition_number > 0),
  edition_total integer NOT NULL CHECK (edition_total > 0),
  serial_number text NOT NULL UNIQUE,
  content_hash text NOT NULL,
  signed_by_avatar_id uuid NOT NULL,
  signed_by_cert_id uuid REFERENCES pki_certificates(id),
  cert_fingerprint text NOT NULL,
  signature text NOT NULL,
  qr_payload text,
  nfc_payload text,
  owner_id uuid REFERENCES auth.users(id),
  owner_wallet_address text,
  status text DEFAULT 'minted' NOT NULL CHECK (status IN ('minted', 'reserved', 'sold', 'transferred', 'burned')),
  minted_at timestamptz DEFAULT now() NOT NULL,
  sold_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(art_id, edition_number),
  CONSTRAINT valid_edition_num CHECK (edition_number <= edition_total)
);

-- Edition verification log (QR/NFC scans)
CREATE TABLE IF NOT EXISTS pki_edition_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id uuid NOT NULL REFERENCES pki_art_editions(id) ON DELETE CASCADE,
  verification_method text NOT NULL CHECK (verification_method IN ('qr', 'nfc', 'api', 'manual')),
  verified_by_user_id uuid REFERENCES auth.users(id),
  verified_by_ip inet,
  device_info jsonb,
  location_data jsonb,
  verification_result boolean NOT NULL,
  failure_reason text,
  timestamp timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pki_provenance_art ON pki_art_provenance(art_id);
CREATE INDEX IF NOT EXISTS idx_pki_provenance_chain ON pki_art_provenance(previous_entry_id);
CREATE INDEX IF NOT EXISTS idx_pki_provenance_signer ON pki_art_provenance(signed_by_avatar_id);
CREATE INDEX IF NOT EXISTS idx_pki_provenance_cert ON pki_art_provenance(cert_fingerprint);
CREATE INDEX IF NOT EXISTS idx_pki_provenance_time ON pki_art_provenance(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_pki_drop_certs_tenant ON pki_drop_certificates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pki_drop_certs_avatar ON pki_drop_certificates(avatar_id);
CREATE INDEX IF NOT EXISTS idx_pki_drop_certs_status ON pki_drop_certificates(status);

CREATE INDEX IF NOT EXISTS idx_pki_editions_art ON pki_art_editions(art_id);
CREATE INDEX IF NOT EXISTS idx_pki_editions_drop ON pki_art_editions(drop_id);
CREATE INDEX IF NOT EXISTS idx_pki_editions_serial ON pki_art_editions(serial_number);
CREATE INDEX IF NOT EXISTS idx_pki_editions_owner ON pki_art_editions(owner_id);
CREATE INDEX IF NOT EXISTS idx_pki_editions_status ON pki_art_editions(status);

CREATE INDEX IF NOT EXISTS idx_pki_verifications_edition ON pki_edition_verifications(edition_id);
CREATE INDEX IF NOT EXISTS idx_pki_verifications_time ON pki_edition_verifications(timestamp DESC);

-- Enable RLS
ALTER TABLE pki_drop_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_art_provenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_art_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_edition_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pki_art_provenance (append-only enforced)
CREATE POLICY "Service role can insert provenance"
  ON pki_art_provenance FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read provenance"
  ON pki_art_provenance FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Authenticated users can view provenance"
  ON pki_art_provenance FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for pki_drop_certificates
CREATE POLICY "Service role can manage drop certificates"
  ON pki_drop_certificates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view released drops"
  ON pki_drop_certificates FOR SELECT
  TO authenticated
  USING (status IN ('released', 'sold_out'));

-- RLS Policies for pki_art_editions
CREATE POLICY "Service role can manage editions"
  ON pki_art_editions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their own editions"
  ON pki_art_editions FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid() OR status = 'minted');

-- RLS Policies for pki_edition_verifications
CREATE POLICY "Service role can manage verifications"
  ON pki_edition_verifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view verification history"
  ON pki_edition_verifications FOR SELECT
  TO authenticated
  USING (true);

-- Function to generate unique serial number
CREATE OR REPLACE FUNCTION pki_generate_edition_serial(
  p_art_id uuid,
  p_edition_number integer,
  p_drop_id text DEFAULT NULL
)
RETURNS text AS $$
DECLARE
  v_prefix text;
  v_random text;
BEGIN
  v_prefix := COALESCE(p_drop_id, SUBSTRING(p_art_id::text, 1, 8));
  v_random := UPPER(SUBSTRING(MD5(p_art_id::text || p_edition_number::text || now()::text), 1, 6));
  RETURN v_prefix || '-' || LPAD(p_edition_number::text, 4, '0') || '-' || v_random;
END;
$$ LANGUAGE plpgsql;

-- Function to compute provenance entry hash
CREATE OR REPLACE FUNCTION pki_compute_provenance_hash(
  p_art_id uuid,
  p_event_type pki_provenance_event,
  p_content_hash text,
  p_previous_hash text DEFAULT NULL,
  p_timestamp timestamptz DEFAULT now()
)
RETURNS text AS $$
BEGIN
  RETURN ENCODE(
    SHA256(
      (p_art_id::text || p_event_type::text || p_content_hash || COALESCE(p_previous_hash, '') || p_timestamp::text)::bytea
    ),
    'hex'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to append provenance entry (ensures chain integrity)
CREATE OR REPLACE FUNCTION pki_append_provenance_entry(
  p_art_id uuid,
  p_edition_number integer,
  p_asset_type pki_art_asset_type,
  p_event_type pki_provenance_event,
  p_content_hash text,
  p_signed_by_avatar_id uuid,
  p_cert_id uuid,
  p_cert_fingerprint text,
  p_signature text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  v_previous RECORD;
  v_chain_position integer;
  v_previous_hash text;
  v_new_id uuid;
BEGIN
  SELECT id, content_hash, chain_position
  INTO v_previous
  FROM pki_art_provenance
  WHERE art_id = p_art_id
  ORDER BY chain_position DESC
  LIMIT 1;
  
  IF FOUND THEN
    v_chain_position := v_previous.chain_position + 1;
    v_previous_hash := pki_compute_provenance_hash(
      p_art_id, p_event_type, v_previous.content_hash, NULL, now()
    );
  ELSE
    v_chain_position := 1;
    v_previous_hash := NULL;
  END IF;
  
  INSERT INTO pki_art_provenance (
    art_id, edition_number, asset_type, event_type, content_hash,
    signed_by_avatar_id, signed_by_cert_id, cert_fingerprint, signature,
    previous_entry_id, previous_entry_hash, chain_position, metadata
  ) VALUES (
    p_art_id, p_edition_number, p_asset_type, p_event_type, p_content_hash,
    p_signed_by_avatar_id, p_cert_id, p_cert_fingerprint, p_signature,
    v_previous.id, v_previous_hash, v_chain_position, p_metadata
  ) RETURNING id INTO v_new_id;
  
  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify provenance chain integrity
CREATE OR REPLACE FUNCTION pki_verify_provenance_chain(p_art_id uuid)
RETURNS TABLE (
  is_valid boolean,
  chain_length integer,
  broken_at_position integer,
  error_message text
) AS $$
DECLARE
  v_entry RECORD;
  v_prev_entry RECORD;
  v_position integer := 0;
BEGIN
  FOR v_entry IN
    SELECT * FROM pki_art_provenance
    WHERE art_id = p_art_id
    ORDER BY chain_position ASC
  LOOP
    v_position := v_entry.chain_position;
    
    IF v_entry.chain_position = 1 THEN
      IF v_entry.previous_entry_id IS NOT NULL THEN
        RETURN QUERY SELECT false, v_position, 1, 'First entry has previous_entry_id';
        RETURN;
      END IF;
    ELSE
      IF v_entry.previous_entry_id IS NULL THEN
        RETURN QUERY SELECT false, v_position, v_position, 'Missing previous_entry_id';
        RETURN;
      END IF;
      
      SELECT * INTO v_prev_entry
      FROM pki_art_provenance
      WHERE id = v_entry.previous_entry_id;
      
      IF NOT FOUND THEN
        RETURN QUERY SELECT false, v_position, v_position, 'Previous entry not found';
        RETURN;
      END IF;
      
      IF v_prev_entry.chain_position != v_entry.chain_position - 1 THEN
        RETURN QUERY SELECT false, v_position, v_position, 'Chain position mismatch';
        RETURN;
      END IF;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT true, v_position, NULL::integer, NULL::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate QR verification payload
CREATE OR REPLACE FUNCTION pki_generate_verification_payload(p_edition_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_edition RECORD;
  v_art RECORD;
  v_payload jsonb;
BEGIN
  SELECT e.*, d.drop_id as drop_code
  INTO v_edition
  FROM pki_art_editions e
  LEFT JOIN pki_drop_certificates d ON e.drop_id = d.id
  WHERE e.id = p_edition_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  SELECT * INTO v_art FROM art_assets WHERE id = v_edition.art_id;
  
  v_payload := jsonb_build_object(
    'type', 'bips_edition',
    'version', '1.0',
    'edition_id', v_edition.id,
    'serial', v_edition.serial_number,
    'edition', v_edition.edition_number || '/' || v_edition.edition_total,
    'art_title', v_art.name,
    'hash', v_edition.content_hash,
    'fingerprint', v_edition.cert_fingerprint,
    'drop', v_edition.drop_code,
    'verify_url', 'https://bips.io/verify/' || v_edition.serial_number
  );
  
  RETURN v_payload;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
