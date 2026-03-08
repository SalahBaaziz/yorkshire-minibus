DROP POLICY "Allow service role full access" ON public.enquiries;

CREATE POLICY "Service role only" ON public.enquiries
  FOR ALL TO service_role USING (true) WITH CHECK (true);