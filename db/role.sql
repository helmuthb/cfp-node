CREATE TABLE "role" (
  id serial NOT NULL,
  user_id integer NOT NULL,
  role text,
  object text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT role_pkey PRIMARY KEY (id),
  CONSTRAINT combination_unique UNIQUE (user_id, object, role)
);

-- make the first user super-admin
insert into "role" (user_id, role, object) values (1, 'admin', '*');