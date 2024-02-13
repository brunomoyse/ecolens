# Ecolens

## First install

```bash
cp .env.example .env
```

## Run all the container

```bash
docker compose up
```

## Access to a container

To access to a running container exec the command (for instance for `django`) :

```bash
docker compose exec django /bin/bash
```

If the container is not running :

```bash
docker compose run --rm django /bin/bash
```

## Backend

### Django commands

To list the available commands :

```bash
      $ docker-compose exec django
django# python manage.py
```

Usefull commands :

```
django# python manage.py createsuperuser   # to create a super user (access to the admin)
django# python manage.py showmigrations    # to show the status of the migrations (passed or not)
django# python manage.py makemigrations    # check the models and create automatically the migrations
django# python manage.py migrate           # run the migrations
```

#### Get "centrale des bilans infos"


```bash
      $ docker-compose exec django
django# python3 manage.py  fetch_accounting_data 0419.859.055
```

## Deployment on the server

### Build the docker images

```bash
$ docker compose -f compose.prod.yml build frontend  # building the image ecolens/frontend_prod for frontend
$ docker compose build django # building the image ecolens/django for backend
```

### Send the image to the server

```bash
$ sh deploy.sh
```

### On the server load the images

```bash
server$ sh load-img.sh
```

### Recreate the containers

```bash
server$ docker compose stop
server$ docker compose up -d
```