-- Optional production content cleanup. NOT applied by the application or build.
-- Review the exact target before executing. The real curriculum is already published.
BEGIN;
UPDATE public.workshops
SET is_published = false
WHERE id = '0646b0fd-f45e-4b76-a853-7f2e44600018'
  AND title = 'How Did It All Begin? Why Do I Act and Think This Way?'
  AND content = 'Test'
  AND is_published = true
RETURNING id, title, is_published;
-- Expect exactly one matching row on first execution. This preserves progress/history.
COMMIT;
