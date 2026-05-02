-- ============================================================
-- EatWise AI — Supabase Backend Setup Script
-- ============================================================
-- Run this entire script inside the Supabase SQL Editor.
-- It creates all tables, indexes, RLS policies, views,
-- helper functions, and triggers needed by the EatWise app.
--
-- Prerequisites:
--   1. Enable "Email/Password" auth in Supabase Dashboard → Auth → Providers.
--   2. (Optional) Enable Google OAuth if you want social login.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ────────────────────────────────────────────────────────────
-- 1. CUSTOM TYPES (ENUMS)
-- ────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE gender_type        AS ENUM ('male', 'female');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE activity_level     AS ENUM ('sedentary', 'light', 'moderate', 'active', 'extreme');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE goal_type          AS ENUM ('lose', 'maintain', 'build');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE meal_type          AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE health_badge       AS ENUM ('Great', 'Good', 'Limit');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE mood_type          AS ENUM ('great', 'good', 'okay', 'low', 'stressed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sleep_quality      AS ENUM ('excellent', 'good', 'fair', 'poor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE theme_preference   AS ENUM ('light', 'dark');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ────────────────────────────────────────────────────────────
-- 2. TABLES
-- ────────────────────────────────────────────────────────────

-- 2a. User Profiles ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  age              SMALLINT    NOT NULL CHECK (age BETWEEN 10 AND 120),
  weight           NUMERIC(5,1) NOT NULL CHECK (weight BETWEEN 20 AND 500),
  height           NUMERIC(5,1) NOT NULL CHECK (height BETWEEN 50 AND 300),
  gender           gender_type    NOT NULL DEFAULT 'male',
  activity         activity_level NOT NULL DEFAULT 'moderate',
  goal             goal_type      NOT NULL DEFAULT 'maintain',
  calorie_goal     INT         NOT NULL DEFAULT 2000,
  macro_protein    INT         NOT NULL DEFAULT 125,   -- grams
  macro_carbs      INT         NOT NULL DEFAULT 250,
  macro_fat        INT         NOT NULL DEFAULT 56,
  health_conditions TEXT[]     DEFAULT '{}',           -- e.g. {'diabetes','hypertension'}
  theme            theme_preference NOT NULL DEFAULT 'light',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2b. Meal Logs ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meals (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date             DATE        NOT NULL DEFAULT CURRENT_DATE,
  name             TEXT        NOT NULL,
  type             meal_type   NOT NULL DEFAULT 'snack',
  calories         NUMERIC(7,1) NOT NULL DEFAULT 0 CHECK (calories >= 0 AND calories <= 10000),
  protein          NUMERIC(6,1) DEFAULT 0 CHECK (protein >= 0 AND protein <= 1000),
  carbs            NUMERIC(6,1) DEFAULT 0 CHECK (carbs >= 0 AND carbs <= 1000),
  fat              NUMERIC(6,1) DEFAULT 0 CHECK (fat >= 0 AND fat <= 1000),
  health_badge     health_badge,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2c. Favorite Recipes ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  prep_time        TEXT,
  cook_time        TEXT,
  difficulty       TEXT,
  ingredients      TEXT[]      DEFAULT '{}',
  steps            TEXT[]      DEFAULT '{}',
  calories         NUMERIC(7,1) DEFAULT 0,
  protein          NUMERIC(6,1) DEFAULT 0,
  carbs            NUMERIC(6,1) DEFAULT 0,
  fat              NUMERIC(6,1) DEFAULT 0,
  health_benefits  TEXT,
  saved_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2d. Water Intake ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS water_intake (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date             DATE        NOT NULL DEFAULT CURRENT_DATE,
  glasses          SMALLINT    NOT NULL DEFAULT 0 CHECK (glasses >= 0 AND glasses <= 20),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

-- 2e. Streak Days ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS streak_days (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date             DATE        NOT NULL DEFAULT CURRENT_DATE,
  active           BOOLEAN     NOT NULL DEFAULT TRUE,
  UNIQUE (user_id, date)
);

-- 2f. Wellness Check-ins (SDG 3) ────────────────────────────
CREATE TABLE IF NOT EXISTS wellness_checkins (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date             DATE        NOT NULL DEFAULT CURRENT_DATE,
  mood             mood_type,
  sleep            sleep_quality,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

-- 2g. AI Analysis Logs (optional audit trail) ───────────────
CREATE TABLE IF NOT EXISTS ai_analysis_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_type       TEXT        NOT NULL CHECK (input_type IN ('image', 'text')),
  input_text       TEXT,
  result_name      TEXT,
  result_calories  NUMERIC(7,1),
  result_protein   NUMERIC(6,1),
  result_carbs     NUMERIC(6,1),
  result_fat       NUMERIC(6,1),
  result_score     SMALLINT,
  result_badge     health_badge,
  suggestions      TEXT[],
  health_impact    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 3. INDEXES
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_meals_user_date      ON meals (user_id, date);
CREATE INDEX IF NOT EXISTS idx_meals_date           ON meals (date);
CREATE INDEX IF NOT EXISTS idx_favorites_user       ON favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_water_user_date      ON water_intake (user_id, date);
CREATE INDEX IF NOT EXISTS idx_streak_user_date     ON streak_days (user_id, date);
CREATE INDEX IF NOT EXISTS idx_wellness_user_date   ON wellness_checkins (user_id, date);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user         ON ai_analysis_logs (user_id, created_at DESC);


-- ────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites          ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake       ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_days        ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_checkins  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_logs   ENABLE ROW LEVEL SECURITY;

-- Helper: current user id
-- Supabase injects auth.uid() automatically for authenticated requests.

-- profiles
CREATE POLICY "Users can view own profile"    ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile"  ON profiles FOR DELETE USING (auth.uid() = id);

-- meals
CREATE POLICY "Users can view own meals"      ON meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meals"    ON meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meals"    ON meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meals"    ON meals FOR DELETE USING (auth.uid() = user_id);

-- favorites
CREATE POLICY "Users can view own favorites"  ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- water_intake
CREATE POLICY "Users can view own water"      ON water_intake FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own water"    ON water_intake FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own water"    ON water_intake FOR UPDATE USING (auth.uid() = user_id);

-- streak_days
CREATE POLICY "Users can view own streaks"    ON streak_days FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks"  ON streak_days FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks"  ON streak_days FOR UPDATE USING (auth.uid() = user_id);

-- wellness_checkins
CREATE POLICY "Users can view own checkins"   ON wellness_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins" ON wellness_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checkins" ON wellness_checkins FOR UPDATE USING (auth.uid() = user_id);

-- ai_analysis_logs
CREATE POLICY "Users can view own logs"       ON ai_analysis_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs"     ON ai_analysis_logs FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 5. HELPER FUNCTIONS
-- ────────────────────────────────────────────────────────────

-- 5a. Auto-create profile on signup ─────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, age, weight, height)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE((NEW.raw_user_meta_data->>'age')::SMALLINT, 25),
    COALESCE((NEW.raw_user_meta_data->>'weight')::NUMERIC, 70),
    COALESCE((NEW.raw_user_meta_data->>'height')::NUMERIC, 170)
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if re-running
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 5b. Auto-update updated_at timestamp ──────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS water_intake_updated_at ON water_intake;
CREATE TRIGGER water_intake_updated_at
  BEFORE UPDATE ON water_intake
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS wellness_checkins_updated_at ON wellness_checkins;
CREATE TRIGGER wellness_checkins_updated_at
  BEFORE UPDATE ON wellness_checkins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- 5c. Get daily nutrition totals for a user on a given date ─
CREATE OR REPLACE FUNCTION public.get_daily_nutrition(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_calories NUMERIC,
  total_protein  NUMERIC,
  total_carbs    NUMERIC,
  total_fat      NUMERIC,
  meal_count     BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(m.calories), 0)  AS total_calories,
    COALESCE(SUM(m.protein), 0)   AS total_protein,
    COALESCE(SUM(m.carbs), 0)     AS total_carbs,
    COALESCE(SUM(m.fat), 0)       AS total_fat,
    COUNT(*)                       AS meal_count
  FROM meals m
  WHERE m.user_id = p_user_id
    AND m.date = p_date;
END;
$$;


-- 5d. Calculate wellness score (mirrors frontend logic) ─────
CREATE OR REPLACE FUNCTION public.get_wellness_score(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_score     INT := 0;
  v_bmi       NUMERIC;
  v_weight    NUMERIC;
  v_height    NUMERIC;
  v_meals     BIGINT;
  v_water     SMALLINT;
  v_mood      mood_type;
  v_sleep     sleep_quality;
  v_streak    INT := 0;
  v_d         DATE;
BEGIN
  -- Get profile
  SELECT weight, height INTO v_weight, v_height FROM profiles WHERE id = p_user_id;
  IF v_weight IS NULL THEN RETURN 0; END IF;

  -- BMI (30 pts)
  v_bmi := v_weight / POWER(v_height / 100.0, 2);
  IF v_bmi >= 18.5 AND v_bmi < 24.9 THEN v_score := v_score + 30;
  ELSIF v_bmi >= 25 AND v_bmi < 30 THEN v_score := v_score + 15;
  ELSIF v_bmi < 18.5 THEN v_score := v_score + 15;
  ELSE v_score := v_score + 5;
  END IF;

  -- Meals logged (20 pts, 5 per meal, max 20)
  SELECT COUNT(*) INTO v_meals FROM meals WHERE user_id = p_user_id AND date = p_date;
  v_score := v_score + LEAST(v_meals * 5, 20)::INT;

  -- Water (20 pts)
  SELECT glasses INTO v_water FROM water_intake WHERE user_id = p_user_id AND date = p_date;
  v_water := COALESCE(v_water, 0);
  v_score := v_score + LEAST(ROUND((v_water::NUMERIC / 8.0) * 20), 20)::INT;

  -- Mood (15 pts)
  SELECT mood INTO v_mood FROM wellness_checkins WHERE user_id = p_user_id AND date = p_date;
  IF v_mood IN ('great', 'good') THEN v_score := v_score + 15;
  ELSIF v_mood = 'okay' THEN v_score := v_score + 10;
  ELSIF v_mood IS NOT NULL THEN v_score := v_score + 5;
  END IF;

  -- Sleep (15 pts)
  SELECT sleep INTO v_sleep FROM wellness_checkins WHERE user_id = p_user_id AND date = p_date;
  IF v_sleep = 'excellent' THEN v_score := v_score + 15;
  ELSIF v_sleep = 'good' THEN v_score := v_score + 12;
  ELSIF v_sleep = 'fair' THEN v_score := v_score + 7;
  ELSIF v_sleep IS NOT NULL THEN v_score := v_score + 3;
  END IF;

  RETURN LEAST(v_score, 100);
END;
$$;


-- 5e. Get weekly streak count ───────────────────────────────
CREATE OR REPLACE FUNCTION public.get_weekly_streak(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT := 0;
  v_d     DATE;
BEGIN
  FOR i IN 0..6 LOOP
    v_d := p_date - i;
    IF EXISTS (
      SELECT 1 FROM streak_days WHERE user_id = p_user_id AND date = v_d AND active = TRUE
    ) OR EXISTS (
      SELECT 1 FROM meals WHERE user_id = p_user_id AND date = v_d
    ) THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;
  RETURN v_count;
END;
$$;


-- 5f. Upsert water intake (INSERT or UPDATE on conflict) ────
CREATE OR REPLACE FUNCTION public.upsert_water_intake(
  p_user_id UUID,
  p_date    DATE,
  p_glasses SMALLINT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO water_intake (user_id, date, glasses)
  VALUES (p_user_id, p_date, p_glasses)
  ON CONFLICT (user_id, date)
  DO UPDATE SET glasses = p_glasses, updated_at = now();
END;
$$;


-- 5g. Upsert wellness check-in ──────────────────────────────
CREATE OR REPLACE FUNCTION public.upsert_wellness_checkin(
  p_user_id UUID,
  p_date    DATE,
  p_mood    mood_type    DEFAULT NULL,
  p_sleep   sleep_quality DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO wellness_checkins (user_id, date, mood, sleep)
  VALUES (p_user_id, p_date, p_mood, p_sleep)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    mood       = COALESCE(p_mood,  wellness_checkins.mood),
    sleep      = COALESCE(p_sleep, wellness_checkins.sleep),
    updated_at = now();
END;
$$;


-- 5h. Toggle streak day ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.toggle_streak_day(
  p_user_id UUID,
  p_date    DATE DEFAULT CURRENT_DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_active BOOLEAN;
BEGIN
  SELECT active INTO v_active FROM streak_days
  WHERE user_id = p_user_id AND date = p_date;

  IF v_active IS NULL THEN
    INSERT INTO streak_days (user_id, date, active) VALUES (p_user_id, p_date, TRUE);
    RETURN TRUE;
  ELSE
    UPDATE streak_days SET active = NOT v_active
    WHERE user_id = p_user_id AND date = p_date;
    RETURN NOT v_active;
  END IF;
END;
$$;


-- ────────────────────────────────────────────────────────────
-- 6. VIEWS (for dashboard convenience)
-- ────────────────────────────────────────────────────────────

-- 6a. Daily summary view ────────────────────────────────────
CREATE OR REPLACE VIEW public.v_daily_summary AS
SELECT
  m.user_id,
  m.date,
  COUNT(*)                        AS meal_count,
  ROUND(SUM(m.calories), 1)      AS total_calories,
  ROUND(SUM(m.protein), 1)       AS total_protein,
  ROUND(SUM(m.carbs), 1)         AS total_carbs,
  ROUND(SUM(m.fat), 1)           AS total_fat,
  COALESCE(w.glasses, 0)         AS water_glasses,
  wc.mood,
  wc.sleep
FROM meals m
LEFT JOIN water_intake w      ON w.user_id = m.user_id AND w.date = m.date
LEFT JOIN wellness_checkins wc ON wc.user_id = m.user_id AND wc.date = m.date
GROUP BY m.user_id, m.date, w.glasses, wc.mood, wc.sleep;


-- 6b. Weekly nutrition trend (last 7 days) ──────────────────
CREATE OR REPLACE VIEW public.v_weekly_trend AS
SELECT
  m.user_id,
  m.date,
  ROUND(SUM(m.calories), 1)  AS total_calories,
  ROUND(SUM(m.protein), 1)   AS total_protein,
  ROUND(SUM(m.carbs), 1)     AS total_carbs,
  ROUND(SUM(m.fat), 1)       AS total_fat,
  COUNT(*)                    AS meal_count
FROM meals m
WHERE m.date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY m.user_id, m.date
ORDER BY m.date;


-- ────────────────────────────────────────────────────────────
-- 7. STORAGE BUCKET (for meal images)
-- ────────────────────────────────────────────────────────────
-- Run this in the Supabase Dashboard → Storage → Create Bucket
-- or use the SQL below:

INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-images', 'meal-images', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can only manage their own folder
CREATE POLICY "Users can upload meal images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'meal-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own meal images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'meal-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own meal images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'meal-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );


-- ────────────────────────────────────────────────────────────
-- 8. GRANT PERMISSIONS
-- ────────────────────────────────────────────────────────────
-- Supabase uses anon and authenticated roles.
-- RLS handles access, but we grant table-level access:

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meals             TO authenticated;
GRANT SELECT, INSERT, DELETE         ON public.favorites         TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON public.water_intake      TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON public.streak_days       TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON public.wellness_checkins TO authenticated;
GRANT SELECT, INSERT                 ON public.ai_analysis_logs  TO authenticated;

GRANT SELECT ON public.v_daily_summary TO authenticated;
GRANT SELECT ON public.v_weekly_trend  TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_daily_nutrition      TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_wellness_score       TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_weekly_streak        TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_water_intake      TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_wellness_checkin  TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_streak_day        TO authenticated;


-- ============================================================
-- DONE! Your EatWise AI backend is ready.
-- ============================================================
--
-- NEXT STEPS:
--   1. Add your Supabase URL + anon key to your .env:
--        VITE_SUPABASE_URL=https://your-project.supabase.co
--        VITE_SUPABASE_ANON_KEY=your-anon-key
--
--   2. Install the client:  npm install @supabase/supabase-js
--
--   3. Create src/lib/supabase.js:
--        import { createClient } from '@supabase/supabase-js'
--        export const supabase = createClient(
--          import.meta.env.VITE_SUPABASE_URL,
--          import.meta.env.VITE_SUPABASE_ANON_KEY
--        )
--
--   4. Replace Zustand localStorage persistence with
--      Supabase calls. The table/function names map 1:1
--      to your current store actions.
-- ============================================================
