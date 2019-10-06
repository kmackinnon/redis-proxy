help:
	@echo ''
	@echo 'Usage: make [TARGET]'
	@echo 'Targets:'
	@echo '  build  '
	@echo '  test   '

build: FORCE
	docker build . -t redis-proxy

test: build
	docker-compose down
	docker-compose up -d
	docker build -f test.Dockerfile . -t redis-proxy-tests
	docker run --rm --network=redis-proxy_default redis-proxy-tests
	docker-compose down

FORCE:
