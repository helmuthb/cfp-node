CREATE TABLE "conference" (
  "id" SERIAL CONSTRAINT "pk_conference" PRIMARY KEY,
  "slug" TEXT UNIQUE NOT NULL,
  "title" TEXT UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "logo_url" TEXT NOT NULL,
  "formats" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP
);

CREATE TABLE "edition" (
  "id" SERIAL CONSTRAINT "pk_edition" PRIMARY KEY,
  "conference" INTEGER UNIQUE NOT NULL,
  "start" DATE,
  "end" DATE,
  "cfp_start" DATE,
  "cfp_end" DATE,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP
);

ALTER TABLE "edition" ADD CONSTRAINT "fk_edition__conference" FOREIGN KEY ("conference") REFERENCES "conference" ("id");

CREATE TABLE "user" (
  "id" SERIAL CONSTRAINT "pk_user" PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "password" TEXT,
  "admin" BOOLEAN DEFAULT FALSE,
  "activation_key" TEXT,
  "reset_key" TEXT,
  "reset_time" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP
);

CREATE TABLE "profile" (
  "id" SERIAL CONSTRAINT "pk_profile" PRIMARY KEY,
  "user" INTEGER UNIQUE NOT NULL,
  "bio" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP
);

ALTER TABLE "profile" ADD CONSTRAINT "fk_profile__user" FOREIGN KEY ("user") REFERENCES "user" ("id");

CREATE TABLE "proposal" (
  "id" SERIAL CONSTRAINT "pk_proposal" PRIMARY KEY,
  "profile" INTEGER NOT NULL,
  "edition" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'submitted',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP
);

CREATE INDEX "idx_proposal__edition" ON "proposal" ("edition");

CREATE INDEX "idx_proposal__profile" ON "proposal" ("profile");

ALTER TABLE "proposal" ADD CONSTRAINT "fk_proposal__edition" FOREIGN KEY ("edition") REFERENCES "edition" ("id");

ALTER TABLE "proposal" ADD CONSTRAINT "fk_proposal__profile" FOREIGN KEY ("profile") REFERENCES "profile" ("id");

CREATE TABLE "review" (
  "proposal" INTEGER NOT NULL,
  "reviewer" INTEGER NOT NULL,
  "rating" INTEGER,
  "comment" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP,
  CONSTRAINT "pk_review" PRIMARY KEY ("proposal", "reviewer")
);

CREATE INDEX "idx_review__reviewer" ON "review" ("reviewer");

ALTER TABLE "review" ADD CONSTRAINT "fk_review__proposal" FOREIGN KEY ("proposal") REFERENCES "proposal" ("id");

ALTER TABLE "review" ADD CONSTRAINT "fk_review__reviewer" FOREIGN KEY ("reviewer") REFERENCES "user" ("id");

CREATE TABLE "role" (
  "conference" INTEGER NOT NULL,
  "user" INTEGER NOT NULL,
  "role" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP,
  CONSTRAINT "pk_role" PRIMARY KEY ("conference", "user")
);

CREATE INDEX "idx_role__user" ON "role" ("user");

ALTER TABLE "role" ADD CONSTRAINT "fk_role__conference" FOREIGN KEY ("conference") REFERENCES "conference" ("id");

ALTER TABLE "role" ADD CONSTRAINT "fk_role__user" FOREIGN KEY ("user") REFERENCES "user" ("id")
