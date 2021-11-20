.PHONY:\
	check\
	run\
	run-build\
	build\
	format\
	test\
	lint\

check: format test lint

run:
	poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 \
		--reload --reload-dir app

run-build: build
	docker run --rm -e PORT=8000 -p 8000:8000 page_sync_backend:latest

build:
	docker build -t page_sync_backend:latest .

format:
	poetry run isort .
	poetry run black .

test:
	poetry run pytest tests

lint:
	poetry run mypy . --pretty
	poetry run flake8 --show-source


