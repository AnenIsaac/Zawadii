-- TEMPORARY: Disable RLS for testing (NOT RECOMMENDED FOR PRODUCTION)
-- This should only be used for testing the reward code generation functionality
-- Re-enable RLS and set proper policies before going to production

ALTER TABLE reward_codes DISABLE ROW LEVEL SECURITY;

-- To re-enable later with proper policies:
-- ALTER TABLE reward_codes ENABLE ROW LEVEL SECURITY; 