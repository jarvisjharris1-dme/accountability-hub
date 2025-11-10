-- Create email verification logs table
CREATE TABLE IF NOT EXISTS email_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  verification_sent_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verification_token TEXT,
  ip_address TEXT,
  user_agent TEXT,
  resend_count INTEGER DEFAULT 0,
  last_resend_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_email_verification_logs_user_id ON email_verification_logs(user_id);
CREATE INDEX idx_email_verification_logs_status ON email_verification_logs(status);
CREATE INDEX idx_email_verification_logs_email ON email_verification_logs(email);

-- Enable RLS
ALTER TABLE email_verification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own verification logs"
  ON email_verification_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all verification logs"
  ON email_verification_logs FOR ALL
  USING (auth.role() = 'service_role');
