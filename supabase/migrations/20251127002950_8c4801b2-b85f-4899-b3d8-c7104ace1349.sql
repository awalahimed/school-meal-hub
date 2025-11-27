-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can insert staff" ON public.staff;
DROP POLICY IF EXISTS "Admins can view all staff" ON public.staff;
DROP POLICY IF EXISTS "Admins can update staff" ON public.staff;
DROP POLICY IF EXISTS "Admins can delete staff" ON public.staff;

-- Create policy for admins to insert staff
CREATE POLICY "Admins can insert staff"
ON public.staff
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create policy for admins to view all staff
CREATE POLICY "Admins can view all staff"
ON public.staff
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for admins to update staff
CREATE POLICY "Admins can update staff"
ON public.staff
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for admins to delete staff
CREATE POLICY "Admins can delete staff"
ON public.staff
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));