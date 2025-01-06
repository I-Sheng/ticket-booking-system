#! /bin/bash

sudo docker-compose up -d && \
cd backend && \
npm run build && \
pm2 start -f dist/index.js --name "ticket-backend" && \
pm2 save && \
pm2 startup && \
npx tsx src/manage.ts &
