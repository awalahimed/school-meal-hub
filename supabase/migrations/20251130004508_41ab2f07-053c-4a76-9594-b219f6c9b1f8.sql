-- Drop the existing function
DROP FUNCTION IF EXISTS public.generate_student_id();

-- Create new function that generates sequential student IDs
CREATE OR REPLACE FUNCTION public.generate_student_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_id TEXT;
  max_id INTEGER;
BEGIN
  -- Get the highest current numeric ID
  SELECT COALESCE(MAX(CAST(student_id AS INTEGER)), 0) INTO max_id
  FROM public.students
  WHERE student_id ~ '^[0-9]+$';
  
  -- Increment and return as text
  new_id := (max_id + 1)::TEXT;
  
  RETURN new_id;
END;
$function$;