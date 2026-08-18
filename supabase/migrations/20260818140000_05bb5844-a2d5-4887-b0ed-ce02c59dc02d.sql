-- =========== FIX: avatars bucket had drifted private ===========
-- 20260814150000 created the avatars bucket as public with a publicly
-- readable SELECT policy — correct, since profile.tsx stores
-- getPublicUrl() results in profiles.avatar_url and every avatar reader
-- across the app (nav, chats, admin rosters, sponsor/mentor/DSE Rep
-- views) expects that URL to just work, indefinitely, with no signing.
-- Something along the way (not any migration in this repo) flipped the
-- live bucket to private and swapped in an authenticated-only read
-- policy, which silently broke every already-uploaded avatar: the app
-- kept writing valid getPublicUrl() links, but a private bucket doesn't
-- serve them, so the image just never rendered. This restores the
-- original, correct state.
UPDATE storage.buckets SET public = true WHERE id = 'avatars';
DROP POLICY IF EXISTS "Avatar images readable by signed-in users" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly readable" ON storage.objects;
CREATE POLICY "Avatar images are publicly readable" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
