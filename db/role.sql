CREATE TABLE "role" (
  id serial NOT NULL,
  user_id integer NOT NULL,
  object text,
  role text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT role_pkey PRIMARY KEY (id),
  CONSTRAINT combination_unique UNIQUE (user_id, object, role)
);
