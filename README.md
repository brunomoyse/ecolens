# Ecolens

## First install

```
cp .env.example .env
```

## Run all the container

```
docker compose up
```

## Access to a container

To access to a running container exec the command (for instance for `django`) :

```
docker compose exec django /bin/bash
```

If the container is not running :

```
docker compose run --rm django /bin/bash
```

## Backend

### Django commands

To list the available commands :

```
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