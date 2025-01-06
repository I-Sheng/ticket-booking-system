docker exec -i postgresql psql -U postgres -d ticket_db < database/createdb.sql
docker exec -i postgresql psql -U postgres -d ticket_db < database/data.sql
