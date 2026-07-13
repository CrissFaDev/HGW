# Accesos seguros HGW

No guardar contrasenas reales en Git, aunque el repositorio sea privado.

## Admin

El usuario administrador se configura con variables de entorno:

```txt
ADMIN_EMAIL
ADMIN_PASSWORD
```

En local estan en `backend/.env`, archivo que no se sube al repositorio.

En Render estan en el servicio backend, seccion Environment.

## Base de datos

La conexion de Aiven se guarda en:

```txt
DATABASE_URL
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

## Cloudinary

Las imagenes se guardan en Cloudinary. Las claves reales deben quedar en variables de entorno:

```txt
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_FOLDER
```
