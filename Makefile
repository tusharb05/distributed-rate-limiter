build:
	docker-compose -f .\docker-compose.yml --env-file .env up -d --build

run:
	docker-compose -f .\docker-compose.yml --env-file .env up -d

down:
	docker-compose -f .\docker-compose.yml --env-file .env down