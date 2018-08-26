CREATE TABLE "profile" (
  id serial NOT NULL,
  user_id integer NOT NULL,
  bio text NOT NULL,
  comments text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT profile_pkey PRIMARY KEY (id),
  CONSTRAINT user_unique UNIQUE (user_id)
);