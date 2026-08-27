# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
yarn dev          # Run with nodemon (auto-reload)
yarn debug        # Run with Node inspector attached

# Production
yarn prod         # Set NODE_ENV=production and run with nodemon (Windows syntax — use cross-env or export on Mac/Linux)

# No test runner is configured
```

Requires a `.env` file with: `MONGODB_URI`, `JWT_SECRET`, `JWT_API_SECRET`, `JWT_EXPIRES_IN`, `JWT_COOKIE_EXPIRES_IN`, `PORT`, and email/Cloudinary credentials.

## Architecture

This is a Hunter x Hunter REST API built with Express + Mongoose, versioned under `/api/v1`.

### Request lifecycle

```
server.js → src/app.js → src/api_routes.js → src/v1/routes/api_routes.js
  → src/v1/routes/index.js (auto-loads all *Routes.js files)
    → individual route files → Controller methods → Service methods → Mongoose models
```

`src/v1/routes/index.js` dynamically `require()`s every file in its own directory (excluding `index.js` and `api_routes.js`) and registers each exported router, so **adding a new route file is enough to register it** — no manual import needed.

### Two authentication systems

- **`auth` middleware** (`src/v1/middlewares/auth.js`): JWT Bearer token for registered `User` accounts (admin/user roles). Used on mutating endpoints.
- **`api` middleware** (`src/v1/middlewares/api.js`): API key (a separate JWT signed with `JWT_API_SECRET`) for `Guest` accounts verified by email. Falls back to Bearer auth if no `api_key` query param is present. Used on public read endpoints.

### Controller / Service / Model pattern

Every resource follows the same layered pattern:

- **BaseController** (`src/v1/controllers/BaseController.js`): provides `create`, `readOne`, `readAll`, `readRandom`, `update`, `delete`. Controllers are instantiated with a service array; the first service becomes `this.BaseService`.
- **BaseService** (`src/v1/services/BaseService.js`): wraps Mongoose operations. Supports optional relation population via `this.with_relation` / `this.relations`. `readAllCustom` delegates filtering/sorting/pagination to `MongoQueryBuilder`.
- **AuthController** is actually `CustomerController` (`src/v1/controllers/AuthController.js` exports `CustomerController` which extends `BaseController`) — the filename is misleading. Auth-specific logic (login, register, password reset) lives in `AuthService`.

### Query API

`MongoQueryBuilder` (`src/v1/utils/MongoQueryBuilder.js`) supports chainable query params:
- Filtering: any field, with operators `gte`, `gt`, `lte`, `lt`, `regex`, `all`, `in`
- `sort=field,-otherField`
- `fields=name,image` (projection)
- `page` + `limit` (default 20) → triggers paginated response shape via `PaginationHelper`

### Response shape

All responses go through `src/v1/utils/responseBuilder.js`:
- Success: `{ status, statusCode, statusText, message, data }`
- Paginated: same but with a `_paginate` key and `data` as array
- Error: `{ status, statusCode, statusText, message, errors, stack }`

### Error handling

`catchUnknownError` wraps async route handlers to forward rejections to Express. `globalErrorHandler` maps Mongoose errors (`CastError`, duplicate key `11000`, `ValidationError`), JWT errors, and bad JSON to typed `AppError` instances. In development the full stack is returned; in production only `isOperational` errors expose their message.

### `old_code/`

This directory contains the previous version of the API. It is not wired into the active server and can be ignored.
