# Google Product Feed GraphQL API
[![Build Status](https://travis-ci.org/anttiviljami/google-product-feed-graphql-api.svg?branch=master)](https://travis-ci.org/anttiviljami/google-product-feed-graphql-api) [![License](http://img.shields.io/:license-mit-blue.svg)](http://anttiviljami.mit-license.org)

Load Google Product Feed XML into postgres and serve via GraphQL API

## Development

```bash
npm install

# copy environment (substitute own values)
cp .env.sample .env
source .env

# optional: start included postgres db with docker
docker-compose up -d

# migrate database
npm run migrate

# load some data from feeds
npm run update-data

# start graphql server
npm run dev

# api url: http://localhost:5000/graphql
# graphiql url: http://localhost:5000/graphiql
```

