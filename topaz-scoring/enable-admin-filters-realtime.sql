-- ============================================================================
-- ENABLE REALTIME FOR ADMIN_FILTERS TABLE
-- ============================================================================
-- Run this in Supabase SQL Editor if admin filter changes are not syncing
-- to judge screens in real-time.
--
-- Supabase Realtime requires tables to be in the supabase_realtime publication.

-- Add admin_filters to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE admin_filters;

-- Verify (optional):
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
