# Products Cache Workshop

## Structure

routes -> middleware -> controllers -> services -> database

## Endpoints

GET /products
GET /products/:id
POST /products
PUT /products/:id
PATCH /products/:id
DELETE /products/:id

GET responses use X-Cache: HIT or X-Cache: MISS.

Cached entries expire after 1 minute.

Successful POST, PUT, PATCH and DELETE requests clear the complete cache.

## Run

npm install
npm start

## Test

npm test
