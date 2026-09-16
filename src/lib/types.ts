export type ArtistMedia = {
  name: string;
  logoUrl: string | null;
  thumbUrl: string | null;
  genre: string | null;
  country: string | null;
  bio: string | null;
};

export type Artist = ArtistMedia & {
  id: string;
  fetchedAt?: string;
};

export type LineupRole = "headliner" | "support";

export type LineupEntry = {
  artistId: string;
  role: LineupRole;
};

export type Concert = {
  id: string;
  date: string;
  venue: string;
  city: string;
  country: string;
  countryCode: string;
  lineup: LineupEntry[];
  notes: string;
  rating: number | null;
  favorite: boolean;
  festival: boolean;
  createdAt: string;
};

export type ConcertDraft = {
  date: string;
  venue: string;
  city: string;
  country: string;
  countryCode: string;
  artists: ArtistMedia[];
  notes: string;
  rating: number | null;
  favorite: boolean;
  festival: boolean;
};
