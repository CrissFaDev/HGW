# HGW

Proyecto nuevo separado en backend y frontend.

## Stack

- Backend: Express + TypeScript
- Frontend: Angular 20
- Base de datos: MySQL
- Imagenes: Cloudinary

## Estructura

```txt
backend/   API TypeScript, MySQL y subida a Cloudinary
frontend/  Pagina publica y admin Angular
```

## Backend

```bash
cd backend
copy .env.example .env
npm run dev
```

Para compilar el backend:

```bash
npm run build
npm start
```

Antes de correrlo, crea la tabla:

```bash
mysql -u root -p < src/db/schema.sql
```

Completa `.env` con tus datos de MySQL y Cloudinary.

## Frontend

```bash
cd frontend
npm start
```

Rutas publicas:

- `http://localhost:4200/`: home con informacion de HGW y Lucy Lozano Vargas.
- `http://localhost:4200/productos`: catalogo en tablas por categoria.
- `http://localhost:4200/login`: inicio de sesion.
- `http://localhost:4200/admin`: administrador protegido.

Credenciales iniciales de desarrollo:

```txt
Correo: admin@hgw.com
Contrasena: Admin12345
```

Puedes cambiarlas en `backend/.env` con `ADMIN_EMAIL` y `ADMIN_PASSWORD` antes de crear el primer usuario.

## Despliegue recomendado

Puedes desplegar backend y frontend separados:

```txt
Frontend Angular -> hosting estatico, Vercel, Netlify o Nginx
Backend Express  -> VPS, Render, Railway o servidor Node
MySQL            -> base local del VPS o servicio administrado
Cloudinary       -> almacenamiento y entrega de imagenes
```

En produccion cambia `frontend/src/environments/environment.ts` para que `apiUrl` apunte a la URL real del backend.
