-- Create the weekly menu templates table for cyclic scheduling
CREATE TABLE IF NOT EXISTS public.weekly_menu_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    day_of_week text NOT NULL,
    meal_type text NOT NULL,
    main_dish text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Ensure we don't have duplicate meals for the same day
    UNIQUE(day_of_week, meal_type)
);

-- Enable Row Level Security
ALTER TABLE public.weekly_menu_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read menu templates
CREATE POLICY "Everyone can read menu templates" 
ON public.weekly_menu_templates 
FOR SELECT 
USING (true);

-- Policy: Only admins can insert menu templates
CREATE POLICY "Admins can insert menu templates" 
ON public.weekly_menu_templates 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Only admins can update menu templates
CREATE POLICY "Admins can update menu templates" 
ON public.weekly_menu_templates 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Only admins can delete menu templates
CREATE POLICY "Admins can delete menu templates" 
ON public.weekly_menu_templates 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_weekly_menu_templates_updated_at
BEFORE UPDATE ON public.weekly_menu_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Pre-fill with placeholder data for all 7 days x 3 meals
INSERT INTO public.weekly_menu_templates (day_of_week, meal_type, main_dish, description)
SELECT 
    days.day, 
    meals.type,
    'Not set',
    'Menu not configured yet'
FROM 
    (VALUES ('Monday'), ('Tuesday'), ('Wednesday'), ('Thursday'), ('Friday'), ('Saturday'), ('Sunday')) AS days(day)
CROSS JOIN 
    (VALUES ('breakfast'), ('lunch'), ('dinner')) AS meals(type)
ON CONFLICT (day_of_week, meal_type) DO NOTHING;