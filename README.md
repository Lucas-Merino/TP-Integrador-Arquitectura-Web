# Jardín de plantas - TP Integrador Arquitectura Web

App web para llevar el registro de las plantas de un jardín: especies, zonas, plantas y los cuidados de cada una (riego, abono, poda, trasplante). Tiene un ABM completo de plantas y una pantalla de reportes.

- **Backend:** Node.js + Express. API REST en `/api/v1`, datos en memoria con un seed que se carga al arrancar.
- **Frontend:** React + Vite.

## Requisitos

- Node.js 20 o superior (los tests usan `node --test` y el modo dev usa `node --watch`).
- npm

## Instalación

Desde la carpeta raíz del proyecto:

```bash
npm install
```

Instala las dependencias del backend y del frontend juntas (es un monorepo con workspaces).

## Ejecución

**Modo desarrollo** (backend en el puerto 3000 y frontend con Vite en el 5173):

```bash
npm run dev
```

Abrir http://localhost:5173

**Modo producción** (Express sirve el frontend ya compilado):

```bash
npm run build
npm start
```

Abrir http://localhost:3000

**Pruebas de la API:**

```bash
npm test
```

Corre las 18 pruebas de endpoints con `node --test`. También hay ejemplos de requests en `backend/pruebas/api.http`.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Levanta backend y frontend a la vez. |
| `npm run dev:backend` | Solo el backend, se reinicia al guardar. |
| `npm run build` | Compila el frontend en `frontend/dist`. |
| `npm start` | Levanta el servidor sirviendo la API y el frontend compilado. |
| `npm test` | Pruebas de los endpoints. |

## Datos

Se guardan en memoria. Cada vez que arranca el servidor se carga un jardín de ejemplo, así que al reiniciar se pierden los cambios y vuelve al estado inicial.

## Documentación de la API

Cada endpoint (ruta, verbo, descripción y status codes) está en [docs/API.md](docs/API.md).
