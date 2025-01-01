-- Generate test data for `users`
INSERT INTO "users" ("email", "username", "password", "role", "phone_number", "is_disabled")
VALUES
('user1@example.com', 'Alice', 'password1', 'host', '1234567890', false),
('user2@example.com', 'Bob', 'password2', 'user', '0987654321', false),
('user3@example.com', 'Charlie', 'password3', 'user', '1122334455', true),
('user4@example.com', 'Daisy', 'password4', 'host', '2233445566', false),
('user5@example.com', 'Eve', 'password5', 'user', '5566778899', false);

-- Generate test data for `arenas`
INSERT INTO "arenas" ("title", "address", "capacity")
VALUES
('Downtown Arena', '123 Main St, Cityville', 5000),
('Uptown Arena', '456 Elm St, Townsville', 3000),
('Eastside Arena', '789 Maple Ave, Eastville', 4000),
('Westside Arena', '101 Oak St, Westville', 2000),
('Northside Arena', '202 Pine St, Northville', 3500);

-- Generate test data for `activities`
INSERT INTO "activities" ("on_sale_date", "start_time", "end_time", "title", "content", "cover_img", "price_level_img", "arena_id", "creator_id")
VALUES
('2024-12-01 12:00:00', '2024-12-15 19:00:00', '2024-12-15 21:00:00', 'Concert A', 'A wonderful evening of music.', null, null, (SELECT _id FROM "arenas" LIMIT 1 OFFSET 0), (SELECT _id FROM "users" WHERE "role" = 'host' LIMIT 1 OFFSET 0)),
('2024-12-05 12:00:00', '2024-12-20 18:00:00', '2024-12-20 20:00:00', 'Basketball Game B', 'Exciting match!',  null, null , (SELECT _id FROM "arenas" LIMIT 1 OFFSET 1), (SELECT _id FROM "users" WHERE "role" = 'host' LIMIT 1 OFFSET 1)),
('2024-12-10 12:00:00', '2024-12-25 20:00:00', '2024-12-25 22:00:00', 'Drama C', 'A captivating performance.',  null, null, (SELECT _id FROM "arenas" LIMIT 1 OFFSET 2), (SELECT _id FROM "users" WHERE "role" = 'host' LIMIT 1 OFFSET 0)),
('2024-12-15 12:00:00', '2024-12-30 19:30:00', '2024-12-30 21:30:00', 'Rock Concert D', 'An electrifying show.',  null, null, (SELECT _id FROM "arenas" LIMIT 1 OFFSET 3), (SELECT _id FROM "users" WHERE "role" = 'host' LIMIT 1 OFFSET 1)),
('2024-12-20 12:00:00', '2024-12-31 18:00:00', '2024-12-31 20:00:00', 'Comedy Show E', 'An evening of laughter.',  null, null, (SELECT _id FROM "arenas" LIMIT 1 OFFSET 4), (SELECT _id FROM "users" WHERE "role" = 'host' LIMIT 1 OFFSET 0));

-- Generate test data for `regions`
INSERT INTO "regions" ("activity_id", "region_name", "region_price", "region_capacity")
VALUES
((SELECT _id FROM "activities" LIMIT 1 OFFSET 0), 'VIP', 300, 100),
((SELECT _id FROM "activities" LIMIT 1 OFFSET 1), 'General', 100, 200),
((SELECT _id FROM "activities" LIMIT 1 OFFSET 2), 'Balcony', 150, 50),
((SELECT _id FROM "activities" LIMIT 1 OFFSET 3), 'Floor', 200, 300),
((SELECT _id FROM "activities" LIMIT 1 OFFSET 4), 'Pit', 500, 20);

-- Generate test data for `tickets`
INSERT INTO "tickets" ("user_id", "activity_id", "region_id", "seat_number", "is_paid")
VALUES
-- User 1 的票
((SELECT _id FROM "users" LIMIT 1 OFFSET 0), (SELECT _id FROM "activities" LIMIT 1 OFFSET 0), (SELECT _id FROM "regions" LIMIT 1 OFFSET 0), 1, true),
((SELECT _id FROM "users" LIMIT 1 OFFSET 0), (SELECT _id FROM "activities" LIMIT 1 OFFSET 1), (SELECT _id FROM "regions" LIMIT 1 OFFSET 1), 2, false),
((SELECT _id FROM "users" LIMIT 1 OFFSET 0), (SELECT _id FROM "activities" LIMIT 1 OFFSET 2), (SELECT _id FROM "regions" LIMIT 1 OFFSET 2), 3, true),

-- User 2 的票
((SELECT _id FROM "users" LIMIT 1 OFFSET 1), (SELECT _id FROM "activities" LIMIT 1 OFFSET 1), (SELECT _id FROM "regions" LIMIT 1 OFFSET 1), 4, true),
((SELECT _id FROM "users" LIMIT 1 OFFSET 1), (SELECT _id FROM "activities" LIMIT 1 OFFSET 2), (SELECT _id FROM "regions" LIMIT 1 OFFSET 2), 5, false),
((SELECT _id FROM "users" LIMIT 1 OFFSET 1), (SELECT _id FROM "activities" LIMIT 1 OFFSET 3), (SELECT _id FROM "regions" LIMIT 1 OFFSET 3), 6, true),

-- User 3 的票
((SELECT _id FROM "users" LIMIT 1 OFFSET 2), (SELECT _id FROM "activities" LIMIT 1 OFFSET 2), (SELECT _id FROM "regions" LIMIT 1 OFFSET 2), 7, false),
((SELECT _id FROM "users" LIMIT 1 OFFSET 2), (SELECT _id FROM "activities" LIMIT 1 OFFSET 3), (SELECT _id FROM "regions" LIMIT 1 OFFSET 3), 8, true),
((SELECT _id FROM "users" LIMIT 1 OFFSET 2), (SELECT _id FROM "activities" LIMIT 1 OFFSET 4), (SELECT _id FROM "regions" LIMIT 1 OFFSET 4), 9, true),

-- User 4 的票
((SELECT _id FROM "users" LIMIT 1 OFFSET 3), (SELECT _id FROM "activities" LIMIT 1 OFFSET 3), (SELECT _id FROM "regions" LIMIT 1 OFFSET 3), 10, true),
((SELECT _id FROM "users" LIMIT 1 OFFSET 3), (SELECT _id FROM "activities" LIMIT 1 OFFSET 4), (SELECT _id FROM "regions" LIMIT 1 OFFSET 4), 11, false),
((SELECT _id FROM "users" LIMIT 1 OFFSET 3), (SELECT _id FROM "activities" LIMIT 1 OFFSET 0), (SELECT _id FROM "regions" LIMIT 1 OFFSET 0), 12, true),

-- User 5 的票
((SELECT _id FROM "users" LIMIT 1 OFFSET 4), (SELECT _id FROM "activities" LIMIT 1 OFFSET 4), (SELECT _id FROM "regions" LIMIT 1 OFFSET 4), 13, true),
((SELECT _id FROM "users" LIMIT 1 OFFSET 4), (SELECT _id FROM "activities" LIMIT 1 OFFSET 0), (SELECT _id FROM "regions" LIMIT 1 OFFSET 0), 14, true),
((SELECT _id FROM "users" LIMIT 1 OFFSET 4), (SELECT _id FROM "activities" LIMIT 1 OFFSET 1), (SELECT _id FROM "regions" LIMIT 1 OFFSET 1), 15, false);

