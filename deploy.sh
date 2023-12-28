if [ -f .env ]; then
    # Load Environment Variables
    export $(cat .env | grep -v '#' | sed 's/\r$//' | awk '/=/ {print $1}' )
fi

docker save -o ecolens_frontend_prod.tar ecolens/frontend_prod
docker save -o ecolens_django.tar ecolens/django
scp ./ecolens_frontend_prod.tar ${SERVER_USER}@${SERVER_IP}:/tmp/ecolens_frontend_prod.tar
scp ./ecolens_django.tar ${SERVER_USER}@${SERVER_IP}:/tmp/ecolens_django.tar