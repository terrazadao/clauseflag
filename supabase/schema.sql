-- ClauseFlag Supabase PostgreSQL Schema
-- Run this migration in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 2. CONTRACTS TABLE
-- ============================================
CREATE TABLE public.contracts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    file_url TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx')),
    file_size INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('US', 'EU', 'UAE', 'IN')),
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi')),
    total_clauses INTEGER DEFAULT 0,
    risky_clauses_found INTEGER DEFAULT 0,
    high_risk_count INTEGER DEFAULT 0,
    medium_risk_count INTEGER DEFAULT 0,
    low_risk_count INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- ============================================
-- 3. CLAUSES TABLE
-- ============================================
CREATE TABLE public.clauses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
    clause_type TEXT NOT NULL CHECK (clause_type IN (
        'termination',
        'liability_limitation',
        'indemnity',
        'auto_renewal',
        'payment_penalties',
        'governing_law',
        'ip_ownership',
        'non_compete'
    )),
    risk_level TEXT CHECK (risk_level IN ('Low', 'Medium', 'High', NULL)),
    text TEXT NOT NULL,
    section_title TEXT,
    clause_number TEXT,
    start_index INTEGER,
    end_index INTEGER,
    explanation_en TEXT,
    explanation_hi TEXT,
    why_it_matters_en TEXT,
    why_it_matters_hi TEXT,
    jurisdiction_note_en TEXT,
    jurisdiction_note_hi TEXT,
    is_risky BOOLEAN DEFAULT FALSE,
    detected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 4. ANALYSIS CREDITS TABLE
-- ============================================
CREATE TABLE public.analysis_credits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    credits_remaining INTEGER DEFAULT 0 NOT NULL,
    total_purchased INTEGER DEFAULT 0 NOT NULL,
    last_purchase_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 5. PAYMENT HISTORY TABLE
-- ============================================
CREATE TABLE public.payment_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    credits_granted INTEGER NOT NULL,
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount INTEGER NOT NULL, -- in smallest currency unit (paise for INR)
    currency TEXT DEFAULT 'inr' NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- Contracts indexes
CREATE INDEX idx_contracts_user_id ON public.contracts(user_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_created_at ON public.contracts(created_at);
CREATE INDEX idx_contracts_user_created ON public.contracts(user_id, created_at DESC);

-- Clauses indexes
CREATE INDEX idx_clauses_contract_id ON public.clauses(contract_id);
CREATE INDEX idx_clauses_clause_type ON public.clauses(clause_type);
CREATE INDEX idx_clauses_risk_level ON public.risk_level);
CREATE INDEX idx_clauses_is_risky ON public.clauses(is_risky);
CREATE INDEX idx_clauses_contract_type ON public.clauses(contract_id, clause_type);
CREATE INDEX idx_clauses_detected_at ON public.clauses(detected_at);

-- Analysis credits indexes
CREATE INDEX idx_analysis_credits_user_id ON public.analysis_credits(user_id);

-- Payment history indexes
CREATE INDEX idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX idx_payment_history_razorpay_id ON public.payment_history(razorpay_order_id);
CREATE INDEX idx_payment_history_status ON public.payment_history(status);
CREATE INDEX idx_payment_history_created_at ON public.payment_history(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile, admins can view all
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Contracts: Users can CRUD their own contracts
CREATE POLICY "Users can view own contracts" ON public.contracts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contracts" ON public.contracts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts" ON public.contracts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contracts" ON public.contracts
    FOR DELETE USING (auth.uid() = user_id);

-- Clauses: Users can view clauses from their contracts
CREATE POLICY "Users can view clauses from own contracts" ON public.clauses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contracts
            WHERE contracts.id = clauses.contract_id
            AND contracts.user_id = auth.uid()
        )
    );

-- Analysis credits: Users can view their own credits
CREATE POLICY "Users can view own credits" ON public.analysis_credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON public.analysis_credits
    FOR UPDATE USING (auth.uid() = user_id);

-- Payment history: Users can view their own payments
CREATE POLICY "Users can view own payments" ON public.payment_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payment_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on auth.users creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON public.contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_credits_updated_at
    BEFORE UPDATE ON public.analysis_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================

-- Create storage bucket for contracts (run in Supabase Dashboard or via API)
-- Note: This SQL-only bucket creation may not work, create via Dashboard
-- INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false);

-- Storage policies for contracts bucket
-- CREATE POLICY "Users can upload own contracts" ON storage.objects
--     FOR INSERT WITH CHECK ( bucket_id = 'contracts' AND auth.uid() = owner );

-- CREATE POLICY "Users can view own contracts" ON storage.objects
--     FOR SELECT USING ( bucket_id = 'contracts' AND auth.uid() = owner );

-- CREATE POLICY "Users can delete own contracts" ON storage.objects
--     FOR DELETE USING ( bucket_id = 'contracts' AND auth.uid() = owner );

-- ============================================
-- INITIAL DATA SEEDS (Optional)
-- ============================================

-- Insert default credit balance for existing users (run manually if needed)
-- INSERT INTO public.analysis_credits (user_id, credits_remaining, total_purchased)
-- SELECT id, 0, 0 FROM public.profiles
-- WHERE NOT EXISTS (
--     SELECT 1 FROM public.analysis_credits WHERE user_id = public.profiles.id
-- );
