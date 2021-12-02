FROM python:3.9 AS exporter
COPY ./poetry.lock ./pyproject.toml /
RUN pip3 install poetry \
    && poetry export -f requirements.txt --output requirements.txt

FROM python:3.9 AS builder
COPY --from=exporter /requirements.txt /requirements.txt
RUN pip3 install --upgrade pip \
    && pip3 install -r requirements.txt

FROM python:3.9-slim AS runner
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages/
COPY --from=builder /usr/local/bin/uvicorn /usr/local/bin/uvicorn
COPY ./app /app
CMD ["sh", "-c", "/usr/local/bin/uvicorn app.main:app --host 0.0.0.0 --port $PORT"]
