-- Close the public Supabase API. The app uses the database password and
-- bypasses RLS. Visitors with the project URL get nothing.

alter table if exists "user" enable row level security;
alter table if exists "session" enable row level security;
alter table if exists "account" enable row level security;
alter table if exists "verification" enable row level security;
alter table if exists artists enable row level security;
alter table if exists concerts enable row level security;
alter table if exists catalog_artists enable row level security;
alter table if exists catalog_venues enable row level security;
alter table if exists friendships enable row level security;
alter table if exists friend_invites enable row level security;
alter table if exists concert_tags enable row level security;

revoke all on table "user" from anon, authenticated;
revoke all on table "session" from anon, authenticated;
revoke all on table "account" from anon, authenticated;
revoke all on table "verification" from anon, authenticated;
revoke all on table artists from anon, authenticated;
revoke all on table concerts from anon, authenticated;
revoke all on table catalog_artists from anon, authenticated;
revoke all on table catalog_venues from anon, authenticated;
revoke all on table friendships from anon, authenticated;
revoke all on table friend_invites from anon, authenticated;
revoke all on table concert_tags from anon, authenticated;
