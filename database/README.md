# PostgreSQL Database

1. 寫 `.env` 檔指定 PostgreSQL 的使用者帳號密碼。請參考 `.env.template`

2. 建立 PostgreSQL 資料庫。
   ```sh
   docker compose up -d
   ```
3. 打開http://localhost:5050/ 用`.env`的帳密登入
   1. ![alt text](readme-assests/img-1.png)
   2. ![alt text](readme-assests/img-2.png)
   3. ![alt text](readme-assests/img-3.png)
   4. Save點下去
   5. 左欄Servers/{step 3.2 設定的name}/Databases/ticket_db/Schemas/public/Tables應該沒東西



4. 建立 tables
   ```sh
   docker exec -i postgres psql -U postgres -d ticket_db < ./createdb.sql
   ```
   執行這個指令應該會看到一堆的"ALTER TABLE"與"CREATE TABLE"。
5. 讀入範例資料
   ```sh
   docker exec -i postgres psql -U postgres -d ticket_db < ./data.sql
   ```
6. 網頁重新整理。左欄Servers/{step 3.2設定的name}/Databases/ticket_db/Schemas/public/Tables會出現所有create的table  
   ![alt text](readme-assests/img-4.png)

7. 寫 `../backend/.env` 檔，讓後端程式可以連過來。記得參考`../backend/.env.template`進行更新。寫的內容類似這樣：
   ```.env
   JWT_SECRET='your jwt secret'
   DATABASE_URL='postgres://postgres:password@localhost:5432/ticket_db'
   ```

7. 若想要重置database

   ```sh
   docker compose down
   docker volume ls
   docker volume rm <要刪除的volume>
   ```