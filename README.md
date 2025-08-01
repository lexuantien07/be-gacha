# Product Management System (NestJS + MongoDB + Redis)

A backend system built using **NestJS**, supporting:

- Product management
- Like/unlike feature
- API caching with Redis
- JWT-based authentication

---

## Setup & Installation

### Requirements

- Node.js
- MongoDB
- Redis

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory and with same variables as `.env.example`:

## Running

### Development

```bash
npm run start:dev
```

## API Documentation

The API documentation is available at [http://localhost:{port}/docs](http://localhost:3000/docs) with Swagger when the server is running.

### Authentication

#### Register

- `POST /auth/register`
- **Body**:

```json
{
  "email": "email",
  "password": "password"
}
```

#### Login

- `POST /auth/login`
- **Body**:

```json
{
  "email": "email",
  "password": "password"
}
```

- **Response**:

```json
{
  "access_token": "access_token",
  "refresh_token": "refresh_token"
}
```

#### Refresh Token

- `POST /auth/refresh`
- **Body**:

```json
{
  "refreshToken": "string"
}
```

- **Response**:

```json
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token"
}
```

### Products

#### Get all products

- `GET /products`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of products per page (default: 10)
- **Response**:

```json
{
  "products": [
    {
      "_id": "product_id",
      "name": "product_name",
      "price": 100,
      "likes": 10,
      "category": "product_category",
      "subcategory": "product_subcategory",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "currentPage": 1,
  "totalPages": 10,
  "limit": 10,
  "total": 100
}
```

#### Create a product

- `POST /products`
- **Headers**:
  - `Authorization`: `Bearer access_token`
- **Body**:

```json
{
  "name": "product_name",
  "price": 0,
  "category": "product_category",
  "subcategory": "product_subcategory"
}
```

- **Response**:

```json
{
  "_id": "product_id",
  "name": "product_name",
  "price": 100,
  "likes": 0,
  "category": "product_category",
  "subcategory": "product_subcategory",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Search products by name

- `GET /products/search?q=`
- **Query Parameters**:
  - `q`: Search term for product name
- **Response**:

```json
[
  {
    "_id": "product_id",
    "name": "product_name",
    "price": 100,
    "likes": 10,
    "category": "product_category",
    "subcategory": "product_subcategory",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### Like/unlike a product

- `POST /products/:id/like`
- **Headers**:
  - `Authorization`: `Bearer access_token`
- **Response**:

```json
{
  "_id": "product_id",
  "name": "product_name",
  "price": 100,
  "likes": 10,
  "category": "product_category",
  "subcategory": "product_subcategory",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## Caching & Optimization

### API Caching with Redis

- The GET /products endpoint is cached based on query page and limit.
- Redis stores cached result for 60 seconds (customizable).
- Reduces redundant MongoDB queries.

### Cache Invalidation

- When a new product is added or a like is toggled, the cache is invalidated
- Ensures data freshness across clients.

## Like/Unlike Feature

- **Toggle-like**: users can like/unlike a product.
- A user cannot like more than once.
- Like action invalidates cache.
