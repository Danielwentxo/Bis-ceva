-- Per-user concert archive. Scoped by user_id (TEXT — matches Better Auth user id).
-- Every query MUST filter by the authenticated user_id from authMiddleware.

create table if not exists artists (
  id text not null,
  user_id text not null,
  name text not null,
  logo_url text,
  thumb_url text,
  genre text,
  country text,
  bio text,
  fetched_at timestamptz,
  primary key (user_id, id)
);

create index if not exists artists_user_id_idx on artists (user_id);

create table if not exists concerts (
  id text not null,
  user_id text not null,
  date text not null,
  venue text not null,
  city text not null,
  country text not null,
  country_code text not null default '',
  lineup jsonb not null default '[]'::jsonb,
  notes text not null default '',
  rating integer,
  favorite boolean not null default false,
  festival boolean not null default false,
  created_at timestamptz not null default CURRENT_TIMESTAMP,
  primary key (user_id, id)
);

create index if not exists concerts_user_id_date_idx on concerts (user_id, date desc);
