/*
  # Add PKI Integration to Domain Services

  1. Overview
    - Extends existing affiliate, gifting, and promo tables with PKI integration
    - Creates audit tables for tracking changes with certificate-based identity
    - Adds tenant scoping where missing

  2. Changes
    - Add tenant_id and PKI columns to existing tables
    - Create new audit tables for commission changes and state transitions
    - Add helper functions for PKI-enforced operations

  3. Security
    - All new tables have RLS enabled
    - Scope-based authorization for sensitive operations
*/

-- Add tenant_id to promo_codes if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promo_codes' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE promo_codes ADD COLUMN tenant_id uuid REFERENCES pki_tenants(id);
  END IF;
END $$;

-- Add PKI columns to promo_codes if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promo_codes' AND column_name = 'created_by_cert_id'
  ) THEN
    ALTER TABLE promo_codes ADD COLUMN created_by_cert_id uuid REFERENCES pki_certificates(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promo_codes' AND column_name = 'name'
  ) THEN
    ALTER TABLE promo_codes ADD COLUMN name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promo_codes' AND column_name = 'description'
  ) THEN
    ALTER TABLE promo_codes ADD COLUMN description text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promo_codes' AND column_name = 'status'
  ) THEN
    ALTER TABLE promo_codes ADD COLUMN status text DEFAULT 'active';
  END IF;
END $$;

-- Create PKI affiliate registry (separate from existing affiliates table)
CREATE TABLE IF NOT EXISTS pki_affiliate_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES pki_tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  affiliate_code text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  commission_rate numeric(5,4) DEFAULT 0.0500 NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 1),
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'active', 'suspended', 'terminated')),
  total_sales numeric(12,2) DEFAULT 0 NOT NULL,
  total_commission numeric(12,2) DEFAULT 0 NOT NULL,
  payout_threshold numeric(10,2) DEFAULT 50.00 NOT NULL,
  last_payout_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(tenant_id, affiliate_code)
);

-- Commission change audit log
CREATE TABLE IF NOT EXISTS pki_affiliate_commission_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES pki_affiliate_registry(id) ON DELETE CASCADE,
  old_rate numeric(5,4) NOT NULL,
  new_rate numeric(5,4) NOT NULL,
  reason text NOT NULL,
  changed_by_cert_id uuid REFERENCES pki_certificates(id),
  changed_by_user_id uuid REFERENCES auth.users(id),
  actor_role text NOT NULL,
  actor_scopes text[] DEFAULT '{}',
  ip_address inet,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- PKI Gift Cards
CREATE TABLE IF NOT EXISTS pki_gift_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES pki_tenants(id) ON DELETE CASCADE,
  code text NOT NULL,
  initial_value numeric(10,2) NOT NULL CHECK (initial_value > 0),
  current_balance numeric(10,2) NOT NULL CHECK (current_balance >= 0),
  currency text DEFAULT 'USD' NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'active', 'depleted', 'expired', 'cancelled')),
  issued_by_cert_id uuid REFERENCES pki_certificates(id),
  issued_by_user_id uuid REFERENCES auth.users(id),
  approved_by_cert_id uuid REFERENCES pki_certificates(id),
  approved_by_user_id uuid REFERENCES auth.users(id),
  fulfilled_by_cert_id uuid REFERENCES pki_certificates(id),
  fulfilled_by_user_id uuid REFERENCES auth.users(id),
  recipient_email text,
  recipient_name text,
  message text,
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(tenant_id, code)
);

-- Gift card state transitions (audit log)
CREATE TABLE IF NOT EXISTS pki_gift_card_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id uuid NOT NULL REFERENCES pki_gift_cards(id) ON DELETE CASCADE,
  from_status text NOT NULL,
  to_status text NOT NULL,
  action text NOT NULL CHECK (action IN ('issue', 'approve', 'fulfill', 'redeem', 'cancel', 'expire')),
  actor_cert_id uuid REFERENCES pki_certificates(id),
  actor_user_id uuid REFERENCES auth.users(id),
  actor_role text NOT NULL,
  actor_scopes text[] DEFAULT '{}',
  amount_changed numeric(10,2),
  notes text,
  ip_address inet,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- PKI Promo usage tracking
CREATE TABLE IF NOT EXISTS pki_promo_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_id uuid NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES pki_tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  order_id text,
  discount_applied numeric(10,2) NOT NULL,
  applied_by_cert_id uuid REFERENCES pki_certificates(id),
  applied_by_user_id uuid REFERENCES auth.users(id),
  actor_role text NOT NULL,
  ip_address inet,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pki_affiliate_tenant ON pki_affiliate_registry(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pki_affiliate_code ON pki_affiliate_registry(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_pki_affiliate_status ON pki_affiliate_registry(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_pki_commission_changes ON pki_affiliate_commission_changes(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_pki_gift_cards_tenant ON pki_gift_cards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pki_gift_cards_code ON pki_gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_pki_gift_cards_status ON pki_gift_cards(status);
CREATE INDEX IF NOT EXISTS idx_pki_gift_transitions ON pki_gift_card_transitions(gift_card_id);
CREATE INDEX IF NOT EXISTS idx_pki_promo_usage_promo ON pki_promo_usage(promo_id);
CREATE INDEX IF NOT EXISTS idx_pki_promo_usage_user ON pki_promo_usage(user_id);

-- Enable RLS
ALTER TABLE pki_affiliate_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_affiliate_commission_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_gift_card_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_promo_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pki_affiliate_registry
CREATE POLICY "Service role can manage pki affiliates"
  ON pki_affiliate_registry FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their own pki affiliate record"
  ON pki_affiliate_registry FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for pki_affiliate_commission_changes
CREATE POLICY "Service role can manage pki commission changes"
  ON pki_affiliate_commission_changes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view pki changes to their affiliate record"
  ON pki_affiliate_commission_changes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pki_affiliate_registry ar
      WHERE ar.id = affiliate_id AND ar.user_id = auth.uid()
    )
  );

-- RLS Policies for pki_gift_cards
CREATE POLICY "Service role can manage pki gift cards"
  ON pki_gift_cards FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view pki gift cards they issued"
  ON pki_gift_cards FOR SELECT
  TO authenticated
  USING (issued_by_user_id = auth.uid());

-- RLS Policies for pki_gift_card_transitions
CREATE POLICY "Service role can manage pki gift card transitions"
  ON pki_gift_card_transitions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view pki transitions for their gift cards"
  ON pki_gift_card_transitions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pki_gift_cards gc
      WHERE gc.id = gift_card_id AND gc.issued_by_user_id = auth.uid()
    )
  );

-- RLS Policies for pki_promo_usage
CREATE POLICY "Service role can manage pki promo usage"
  ON pki_promo_usage FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their own pki promo usage"
  ON pki_promo_usage FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Function to change affiliate commission with PKI enforcement
CREATE OR REPLACE FUNCTION pki_change_affiliate_commission(
  p_affiliate_id uuid,
  p_new_rate numeric(5,4),
  p_reason text,
  p_cert_id uuid DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,
  p_actor_role text DEFAULT 'service',
  p_actor_scopes text[] DEFAULT '{}',
  p_ip_address inet DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_old_rate numeric(5,4);
  v_has_permission boolean := false;
BEGIN
  SELECT commission_rate INTO v_old_rate
  FROM pki_affiliate_registry
  WHERE id = p_affiliate_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Affiliate not found';
  END IF;
  
  IF p_actor_role = 'kee' THEN
    v_has_permission := true;
  ELSIF 'affiliate:write' = ANY(p_actor_scopes) OR 'admin:affiliate' = ANY(p_actor_scopes) THEN
    v_has_permission := true;
  END IF;
  
  IF NOT v_has_permission THEN
    RAISE EXCEPTION 'Insufficient permissions to change commission rate. Required: affiliate:write or admin:affiliate scope';
  END IF;
  
  UPDATE pki_affiliate_registry
  SET commission_rate = p_new_rate, updated_at = now()
  WHERE id = p_affiliate_id;
  
  INSERT INTO pki_affiliate_commission_changes (
    affiliate_id, old_rate, new_rate, reason,
    changed_by_cert_id, changed_by_user_id, actor_role, actor_scopes, ip_address
  ) VALUES (
    p_affiliate_id, v_old_rate, p_new_rate, p_reason,
    p_cert_id, p_user_id, p_actor_role, p_actor_scopes, p_ip_address
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to transition gift card state with PKI enforcement
CREATE OR REPLACE FUNCTION pki_transition_gift_card_state(
  p_gift_card_id uuid,
  p_action text,
  p_cert_id uuid DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,
  p_actor_role text DEFAULT 'service',
  p_actor_scopes text[] DEFAULT '{}',
  p_amount_changed numeric(10,2) DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_ip_address inet DEFAULT NULL
)
RETURNS text AS $$
DECLARE
  v_current_status text;
  v_new_status text;
  v_allowed_transitions jsonb := '{
    "pending": {"approve": "approved", "cancel": "cancelled"},
    "approved": {"fulfill": "active", "cancel": "cancelled"},
    "active": {"redeem": "active", "deplete": "depleted", "expire": "expired", "cancel": "cancelled"},
    "depleted": {},
    "expired": {},
    "cancelled": {}
  }'::jsonb;
  v_required_scope text;
BEGIN
  SELECT status INTO v_current_status
  FROM pki_gift_cards
  WHERE id = p_gift_card_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Gift card not found';
  END IF;
  
  v_new_status := v_allowed_transitions->v_current_status->>p_action;
  
  IF v_new_status IS NULL THEN
    RAISE EXCEPTION 'Invalid transition: % from % status', p_action, v_current_status;
  END IF;
  
  CASE p_action
    WHEN 'issue' THEN v_required_scope := 'gift:issue';
    WHEN 'approve' THEN v_required_scope := 'gift:approve';
    WHEN 'fulfill' THEN v_required_scope := 'gift:fulfill';
    ELSE v_required_scope := 'gift:manage';
  END CASE;
  
  IF p_actor_role != 'kee' AND NOT (v_required_scope = ANY(p_actor_scopes)) AND NOT ('admin:gift' = ANY(p_actor_scopes)) THEN
    RAISE EXCEPTION 'Insufficient permissions. Required scope: %', v_required_scope;
  END IF;
  
  UPDATE pki_gift_cards
  SET 
    status = v_new_status,
    current_balance = CASE WHEN p_amount_changed IS NOT NULL THEN current_balance - p_amount_changed ELSE current_balance END,
    approved_by_cert_id = CASE WHEN p_action = 'approve' THEN p_cert_id ELSE approved_by_cert_id END,
    approved_by_user_id = CASE WHEN p_action = 'approve' THEN p_user_id ELSE approved_by_user_id END,
    fulfilled_by_cert_id = CASE WHEN p_action = 'fulfill' THEN p_cert_id ELSE fulfilled_by_cert_id END,
    fulfilled_by_user_id = CASE WHEN p_action = 'fulfill' THEN p_user_id ELSE fulfilled_by_user_id END,
    updated_at = now()
  WHERE id = p_gift_card_id;
  
  INSERT INTO pki_gift_card_transitions (
    gift_card_id, from_status, to_status, action,
    actor_cert_id, actor_user_id, actor_role, actor_scopes,
    amount_changed, notes, ip_address
  ) VALUES (
    p_gift_card_id, v_current_status, v_new_status, p_action,
    p_cert_id, p_user_id, p_actor_role, p_actor_scopes,
    p_amount_changed, p_notes, p_ip_address
  );
  
  RETURN v_new_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to apply promo code with PKI enforcement
CREATE OR REPLACE FUNCTION pki_apply_promo_code(
  p_promo_code text,
  p_tenant_id uuid,
  p_order_id text,
  p_order_value numeric(10,2),
  p_cert_id uuid DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,
  p_actor_role text DEFAULT 'client',
  p_ip_address inet DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_promo RECORD;
  v_discount numeric(10,2) := 0;
  v_usage_count integer;
BEGIN
  IF p_actor_role NOT IN ('kee', 'service', 'client') THEN
    RAISE EXCEPTION 'Promo application requires appropriate role';
  END IF;
  
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE code = p_promo_code
    AND (tenant_id IS NULL OR tenant_id = p_tenant_id)
    AND (status IS NULL OR status = 'active');
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired promo code');
  END IF;
  
  IF v_promo.max_uses IS NOT NULL AND v_promo.current_uses >= v_promo.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'Promo code usage limit reached');
  END IF;
  
  CASE v_promo.discount_type
    WHEN 'percentage' THEN
      v_discount := p_order_value * (v_promo.discount_value / 100);
    WHEN 'fixed' THEN
      v_discount := v_promo.discount_value;
    ELSE
      v_discount := v_promo.discount_value;
  END CASE;
  
  INSERT INTO pki_promo_usage (
    promo_id, tenant_id, user_id, order_id,
    discount_applied, applied_by_cert_id, applied_by_user_id,
    actor_role, ip_address
  ) VALUES (
    v_promo.id, p_tenant_id, p_user_id, p_order_id,
    v_discount, p_cert_id, p_user_id,
    p_actor_role, p_ip_address
  );
  
  UPDATE promo_codes
  SET current_uses = COALESCE(current_uses, 0) + 1, updated_at = now()
  WHERE id = v_promo.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'promo_id', v_promo.id,
    'discount_type', v_promo.discount_type,
    'discount_applied', v_discount,
    'original_value', p_order_value,
    'final_value', p_order_value - v_discount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
