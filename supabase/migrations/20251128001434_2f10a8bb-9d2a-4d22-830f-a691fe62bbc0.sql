-- 1. Create the meal_schedules table
CREATE TABLE IF NOT EXISTS public.meal_schedules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    meal_type text NOT NULL UNIQUE,
    start_time time NOT NULL,
    end_time time NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.meal_schedules ENABLE ROW LEVEL SECURITY;

-- 3. Add RLS Policies
CREATE POLICY "Everyone can read schedules" 
ON public.meal_schedules 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only admins can update schedules" 
ON public.meal_schedules 
FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Insert Default Ethiopian University Schedule (International Format)
INSERT INTO public.meal_schedules (meal_type, start_time, end_time)
VALUES 
  ('breakfast', '06:00:00', '08:00:00'),
  ('lunch', '12:00:00', '14:00:00'),
  ('dinner', '18:00:00', '19:00:00')
ON CONFLICT (meal_type) DO NOTHING;