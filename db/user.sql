CREATE TABLE "user" (
  id serial NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  password_hash text,
  activation_key text,
  reset_key text,
  reset_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_pkey PRIMARY KEY (id),
  CONSTRAINT email_unique UNIQUE (email)
);
