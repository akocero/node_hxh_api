# HxH API — Backend

A free, open-source **REST API** for the Hunter x Hunter anime and manga universe. Get structured JSON data for characters, groups, Nen types, abilities, and more.

Base URL: `https://hxh-api.onrender.com/api/v1`  
Docs: [github.com/akocero/hxh_api_docs](https://github.com/akocero/hxh_api_docs)  
Frontend: [hxh.eugenebadato.com](https://hxh.eugenebadato.com)

---

## Quick Start

```http
GET /api/v1/characters?limit=5
x-api-key: your_api_key_here
```

Generate a free API key at [hxh.eugenebadato.com](https://hxh.eugenebadato.com) — no credit card required.

---

## Endpoints

| Resource | Endpoint |
|---|---|
| All characters | `GET /characters` |
| Single character | `GET /characters/:id` |
| Random character | `GET /characters/random` |
| All groups | `GET /groups` |
| Single group | `GET /groups/:id` |
| Random group | `GET /groups/random` |

### Query Parameters

| Param | Description | Example |
|---|---|---|
| `limit` | Items per page (default 20) | `?limit=10` |
| `page` | Page number | `?page=2` |
| `sort` | Sort by field (`-` for desc) | `?sort=-createdAt` |
| `fields` | Field projection | `?fields=name,nen_type` |
| `nen_type` | Filter by Nen type | `?nen_type=enhancement` |
| `state` | Filter by state | `?state=alive` |

### Response Shape

```json
{
  "status": "success",
  "data": [ { "name": "gon freecss", "nen_type": ["enhancement"], ... } ],
  "_paginate": { "page": 1, "limit": 20, "total": 248, "pages": 13 }
}
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (user tokens + API key tokens) |
| File storage | Cloudinary |
| Email | Nodemailer |
| Deployment | Render |

---

## Local Development

```bash
# Install dependencies
yarn install

# Start dev server with auto-reload
yarn dev
```

Create a `.env` file with the following variables:

```env
MONGODB_URI=
JWT_SECRET=
JWT_API_SECRET=
JWT_EXPIRES_IN=
JWT_COOKIE_EXPIRES_IN=
PORT=
# Email credentials
# Cloudinary credentials
```

---

## Architecture

```
server.js
└── src/app.js
    └── src/api_routes.js
        └── src/v1/routes/
            ├── index.js        ← auto-loads all *Routes.js files
            ├── characterRoutes.js
            ├── groupRoutes.js
            └── ...
```

Each resource follows a **Controller → Service → Model** pattern built on `BaseController` and `BaseService`. The `MongoQueryBuilder` utility handles filtering, sorting, field projection, and pagination uniformly across all endpoints.

---

## Author

Created by **Eugene Paul Badato**

- Portfolio: [eugenebadato.com](https://eugenebadato.com)
- GitHub: [@akocero](https://github.com/akocero)
- Email: akocero15@gmail.com

---

## License

MIT — free to use, fork, and contribute to.
