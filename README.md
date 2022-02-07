

## Warning

This project has been developed in 2019, since then the tech stack/frameworks/Third-party APIs might have changed.

## Description

Shopify starter framework based on NEST.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# incremental rebuild (webpack)
$ npm run webpack
$ npm run start:hmr

# production mode
$ npm run start:prod
```

## 1. Local development (MacOS)
### Install nginx
```bash
brew update
brew install nginx
```
### Nginx commands
```bash
brew services start nginx
brew services stop nginx
brew services restart nginx
```
## 2. Setting Up HTTPS for localhost
**STOREFRONT NOTE !!!**
```bash
Edit
hive-api/devops/local/local-nginx.conf
Modify location /unmatched-storefront/ to point to your storefront project location
```
#### 2.1 Create SSL certificates
SSL certificates have already been created for localhost and can be found within /project/devops/local-ssl and has been following this tutorial [SSL Cerfificate for Nginx](https://www.humankode.com/ssl/create-a-selfsigned-certificate-for-nginx-in-5-minutes)
```bash
mkdir /usr/local/etc/nginx/ssl-local
cd hive-api/devops/local-ssl
cp * /usr/local/etc/nginx/ssl-local/
nano /usr/local/etc/nginx/nginx.conf
```
Before the last closing parenthesis add the following line
```bash
include /usr/local/etc/nginx/ssl-local/local-nginx.conf;
```

#### 2.2 Reload nginx
```bash
brew services restart nginx
```

#### 2.3 Reload nginx
```bash
brew services restart nginx
```

#### 2.4 Test configuration
```bash
nginx -t
```

#### 2.5 Chrome trust certificate
1.5.1 - Start node server ```npm start:dev```
1.5.2 - Visit https://localhost and trust the certificate ( You might need to do this thime to time )

## 3. Test
```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
