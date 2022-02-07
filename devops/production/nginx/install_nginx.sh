
#!/bin/bash
apt update
apt install nginx
ufw allow 'Nginx Full'
systemctl status nginx
printf "NGINX INSTALLED - MOVE TO CONFIG\n\n"
cp conf-x /etc/nginx/sites-available/default
sudo nginx -t
systemctl restart nginx
printf "NGINX INSTALLED - Creating /var/lib/letsencrypt folders \n\n"