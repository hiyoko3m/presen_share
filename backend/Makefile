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
	docker run --rm -p 8000:80 page_sync_backend:latest

build:
	docker build -t page_sync_backend:latest .

format:
	poetry run isort . --skip .venv
	poetry run black . --exclude .venv

test:
	poetry run pytest tests

lint:
	poetry run mypy . --exclude .venv
	poetry run flake8 . --exclude .venv


