-- Friends, email invites, and concert tags. Additive. Existing tables are untouched.

create table if not exists friendships (
  user_id text not null,
  friend_id text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);

create index if not exists friendships_friend_idx on friendships (friend_id, status);

create table if not exists friend_invites (
  id text primary key,
  from_user_id text not null,
  email text not null,
  token text not null unique,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists friend_invites_email_idx on friend_invites (lower(email));

create table if not exists concert_tags (
  id text primary key,
  concert_id text not null,
  from_user_id text not null,
  to_user_id text not null,
  status text not null default 'pending',
  copied_concert_id text,
  created_at timestamptz not null default now(),
  unique (concert_id, from_user_id, to_user_id)
);

create index if not exists concert_tags_to_idx on concert_tags (to_user_id, status);
