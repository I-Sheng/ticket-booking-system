CREATE TABLE "users" (
  "email" varchar PRIMARY KEY,
  "username" varchar,
  "role" varchar,
  "phone_number" varchar,
  "is_disabled" bool,
  "created_at" timestamp
);

CREATE TABLE "password" (
  "email" varchar PRIMARY KEY,
  "password" varchar
);

CREATE TABLE "ticket" (
  "id" integer PRIMARY KEY,
  "created_at" timestamp,
  "owner_email" varchar,
  "activity_id" integer,
  "region" varchar,
  "seat_number" integer,
  "is_paid" bool
);

CREATE TABLE "activity" (
  "id" integer PRIMARY KEY,
  "on_sale_date" date,
  "start_time" date[],
  "end_time" date[],
  "title" varchar,
  "content" varchar,
  "cover_img" file,
  "price_level_img" file,
  "arena_id" integer,
  "region_name" varchar[],
  "region_price" integer[]
);

CREATE TABLE "arena" (
  "id" integer PRIMARY KEY,
  "title" varchar,
  "address" varchar,
  "capacity" integer
);

ALTER TABLE "password" ADD FOREIGN KEY ("email") REFERENCES "users" ("email");

ALTER TABLE "ticket" ADD FOREIGN KEY ("owner_email") REFERENCES "users" ("email");

ALTER TABLE "ticket" ADD FOREIGN KEY ("activity_id") REFERENCES "activity" ("id");

ALTER TABLE "activity" ADD FOREIGN KEY ("arena_id") REFERENCES "arena" ("id");
