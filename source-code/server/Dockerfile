FROM python:3.10.7-slim-buster


COPY . /app

WORKDIR /app

RUN pip install pipenv
RUN pipenv install --system --deploy --ignore-pipfile

EXPOSE 8000

CMD uvicorn server:app --host=0.0.0.0 --reload
