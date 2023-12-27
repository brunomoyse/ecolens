

# First install

```
cp .env.example .env
```

# Run all the container

```
docker compose up
```


# Access to a container

To access to a running container exec the command (for instance for `django`) :

```
docker compose exec django /bin/bash
```

If the container is not running :

```
docker compose run --rm django /bin/bash
```
