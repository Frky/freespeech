FROM python:2.7

RUN mkdir -p /app
COPY requirements.txt /app
WORKDIR /app

RUN pip install -r requirements.txt

COPY . /app

CMD ./manage.py runserver 0.0.0.0:8000