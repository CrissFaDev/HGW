# Pag HGW Backend

Express + TypeScript API for editable website content with MySQL and Cloudinary.

## Setup

1. Create a MySQL database and table:

   ```bash
   mysql -u root -p < src/db/schema.sql
   ```

2. Copy `.env.example` to `.env` and fill the values.

3. Run the API:

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: run the TypeScript API with hot reload.
- `npm run typecheck`: validate TypeScript types without emitting files.
- `npm run build`: compile `src/**/*.ts` into `dist/`.
- `npm start`: run the compiled API from `dist/server.js`.

## Endpoints

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/public/products`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `GET /api/admin/discounts`
- `POST /api/admin/discounts`

Catalog admin routes use `Authorization: Bearer <token>` from `/api/auth/login`.

For create/update requests with an image, send `multipart/form-data` with an `image` file field.
