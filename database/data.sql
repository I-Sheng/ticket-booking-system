-- users 表
INSERT INTO "users" ("email", "username", "role", "phone_number", "is_disabled", "created_at") VALUES
('user1@example.com', 'JohnDoe', 'admin', '1234567890', FALSE, '2024-12-01 10:00:00'),
('user2@example.com', 'JaneSmith', 'user', '0987654321', FALSE, '2024-12-02 11:00:00'),
('user3@example.com', 'AliceWonder', 'user', '1122334455', TRUE, '2024-12-03 12:00:00'),
('user4@example.com', 'BobBuilder', 'user', '2233445566', FALSE, '2024-12-04 13:00:00'),
('user5@example.com', 'CharlieBrown', 'user', '5566778899', FALSE, '2024-12-05 14:00:00');

-- password 表
INSERT INTO "password" ("email", "password") VALUES
('user1@example.com', 'hashed_password1'),
('user2@example.com', 'hashed_password2'),
('user3@example.com', 'hashed_password3'),
('user4@example.com', 'hashed_password4'),
('user5@example.com', 'hashed_password5');

-- arena 表
INSERT INTO "arena" ("id", "title", "address", "capacity") VALUES
(1, 'Downtown Arena', '123 Main St, Cityville', 5000),
(2, 'Uptown Arena', '456 Elm St, Townsville', 3000),
(3, 'Eastside Arena', '789 Maple Ave, Eastville', 4000),
(4, 'Westside Arena', '101 Oak St, Westville', 2000),
(5, 'Northside Arena', '202 Pine St, Northville', 3500);

-- activity 表
INSERT INTO "activity" ("id", "on_sale_date", "start_time", "end_time", "title", "content", "cover_img", "price_level_img", "arena_id", "region_name", "region_price") VALUES
(1, '2024-11-25', ARRAY['2024-12-15 18:00:00'], ARRAY['2024-12-15 21:00:00'], 'Concert A', 'A wonderful evening of music.', 'cover1.jpg', 'price1.jpg', 1, ARRAY['VIP', 'General'], ARRAY[200, 50]),
(2, '2024-11-28', ARRAY['2024-12-20 19:00:00'], ARRAY['2024-12-20 22:30:00'], 'Basketball Game B', 'Exciting match!', 'cover2.jpg', 'price2.jpg', 2, ARRAY['Court-side', 'Regular'], ARRAY[500, 100]),
(3, '2024-11-30', ARRAY['2024-12-22 17:00:00'], ARRAY['2024-12-22 20:00:00'], 'Comedy Show C', 'An evening full of laughter.', 'cover3.jpg', 'price3.jpg', 3, ARRAY['Front-row', 'Middle', 'Back'], ARRAY[150, 100, 50]),
(4, '2024-12-01', ARRAY['2024-12-25 18:00:00'], ARRAY['2024-12-25 21:30:00'], 'Drama D', 'A captivating drama performance.', 'cover4.jpg', 'price4.jpg', 4, ARRAY['Balcony', 'Floor'], ARRAY[300, 120]),
(5, '2024-12-03', ARRAY['2024-12-28 20:00:00'], ARRAY['2024-12-28 23:00:00'], 'Rock Concert E', 'An electrifying rock concert.', 'cover5.jpg', 'price5.jpg', 5, ARRAY['Pit', 'Seating'], ARRAY[400, 80]);

-- ticket 表
INSERT INTO "ticket" ("id", "created_at", "owner_email", "activity_id", "region", "seat_number", "is_paid") VALUES
(1, '2024-12-01 14:00:00', 'user1@example.com', 1, 'VIP', 1, TRUE),
(2, '2024-12-01 15:00:00', 'user2@example.com', 1, 'General', 100, FALSE),
(3, '2024-12-02 10:00:00', 'user3@example.com', 2, 'Court-side', 5, TRUE),
(4, '2024-12-03 11:00:00', 'user4@example.com', 3, 'Middle', 20, FALSE),
(5, '2024-12-04 12:00:00', 'user5@example.com', 4, 'Floor', 10, TRUE);

