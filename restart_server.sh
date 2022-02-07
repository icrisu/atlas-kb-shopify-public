#!/bin/bash
pm2 stop all
export NODE_ENV=production 
pm2 start dist/main.js