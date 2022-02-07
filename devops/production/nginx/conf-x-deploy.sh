#!/bin/bash
printf "RELOAD CONF \n\n"
cp conf-x /etc/nginx/sites-available/default
sudo nginx -t
systemctl restart nginx