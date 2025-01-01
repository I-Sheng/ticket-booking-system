#! /bin/bash

docker compose up --build -d && \
cd backend && \
npm run build && \
pm2 start dist/index.js --name "ticket-backend" && \
pm2 save && \
pm2 startup && \
tsx src/manage.ts &
