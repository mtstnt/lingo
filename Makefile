dev-serve:
	docker compose -f compose.dev.yml up -d && \
	cd server && \
	bun start:dev
	
dev-resetdb:
	docker compose -f compose.dev.yml down && \
	rm -rf volumes/postgres && \
	docker compose -f compose.dev.yml up -d