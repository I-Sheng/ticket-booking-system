
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "users" (
  "_id" uuid not null default uuid_generate_v4() PRIMARY KEY,
  "email" varchar,
  "username" varchar,
  "password" varchar,
  "role" varchar,
  "phone_number" varchar,
  "is_disabled" boolean default false,
  "created_at" timestamp with time zone not null default now()
);

CREATE TABLE "arenas" (
  "_id" uuid not null default uuid_generate_v4() PRIMARY KEY,
  "title" varchar,
  "address" varchar,
  "capacity" integer
);

CREATE TABLE "activities" (
  "_id" uuid not null default uuid_generate_v4() PRIMARY KEY,
  "on_sale_date" timestamp,
  "start_time" timestamp,
  "end_time" timestamp,
  "title" varchar,
  "content" varchar,
  "cover_img" bytea,
  "price_level_img" bytea,
  "arena_id" uuid,
  "creator_id" uuid,
  "is_arichived" boolean default false
);

CREATE TABLE "regions" (
  "_id" uuid not null default uuid_generate_v4() PRIMARY KEY,
  "activity_id" uuid,
  "region_name" varchar,
  "region_price" integer,
  "region_capacity" integer
);

CREATE TABLE "tickets" (
  "_id" uuid not null default uuid_generate_v4() PRIMARY KEY,
  "user_id" uuid,
  "created_at" timestamp with time zone not null default now(),
  "activity_id" uuid,
  "region_id" uuid,
  "seat_number" integer,
  "is_paid" boolean default false
);
ALTER TABLE "tickets" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("_id");

ALTER TABLE "tickets" ADD FOREIGN KEY ("activity_id") REFERENCES "activities" ("_id");

ALTER TABLE "tickets" ADD FOREIGN KEY ("region_id") REFERENCES "regions" ("_id");

ALTER TABLE "activities" ADD FOREIGN KEY ("arena_id") REFERENCES "arenas" ("_id");

ALTER TABLE "activities" ADD FOREIGN KEY ("creator_id") REFERENCES "users" ("_id");

ALTER TABLE "regions" ADD FOREIGN KEY ("activity_id") REFERENCES "activities" ("_id");
