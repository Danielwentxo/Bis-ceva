create table if not exists catalog_artists (
  id text primary key,
  name text not null,
  logo_url text,
  thumb_url text,
  genre text,
  country text,
  bio text,
  created_by text,
  created_at timestamptz not null default CURRENT_TIMESTAMP
);

create index if not exists catalog_artists_name_idx on catalog_artists (lower(name));

create table if not exists catalog_venues (
  id text primary key,
  venue text not null,
  city text not null,
  country text not null default '',
  country_code text not null default '',
  created_by text,
  created_at timestamptz not null default CURRENT_TIMESTAMP
);

create index if not exists catalog_venues_venue_idx on catalog_venues (lower(venue));
