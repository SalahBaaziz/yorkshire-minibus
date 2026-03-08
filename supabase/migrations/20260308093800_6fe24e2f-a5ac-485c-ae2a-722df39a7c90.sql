CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  journey_type TEXT,
  passengers TEXT,
  pickup_address TEXT,
  dropoff_address TEXT,
  date TEXT,
  pickup_time TEXT,
  return_journey BOOLEAN DEFAULT false,
  return_time TEXT,
  distance_miles NUMERIC,
  duration_minutes INTEGER,
  notes TEXT,
  estimated_price NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access" ON public.enquiries
  FOR ALL USING (true) WITH CHECK (true);