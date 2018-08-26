CREATE TABLE "series" (
  id serial NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  details text,
  link text,
  logo_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT series_pkey PRIMARY KEY (id),
  CONSTRAINT slug_unique UNIQUE (slug),
  CONSTRAINT title_unique UNIQUE(title)
);