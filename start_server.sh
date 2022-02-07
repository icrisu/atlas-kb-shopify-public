#!/bin/bash
npm run prestart:prod
npm run build
pm2 stop all
export NODE_ENV=production 
pm2 start dist/main.js