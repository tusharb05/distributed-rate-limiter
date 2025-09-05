build:
	docker-compose -f .\docker-compose.yml --env-file .env up --build

run:
	docker-compsoe -f .\docker-compose.yml --env-file .env up