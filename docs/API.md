# API del jardín de plantas

Base: `http://localhost:3000/api/v1`. Todo entra y sale en JSON (`Content-Type: application/json`). Los ids son UUID que genera el servidor.

Los datos viven en memoria: cada vez que arranca el servidor se carga un jardín de ejemplo (7 especies, 5 zonas, 13 plantas con sus cuidados).

## Errores

Todos los errores tienen la misma forma:

```json
{ "error": "No existe la planta 00000000-0000-0000-0000-000000000000" }
```

| Status | Cuándo |
|---|---|
| 400 | El pedido está mal armado: JSON roto, el cuerpo no es un objeto, o un parámetro de query inválido (`page`, `limit`, `meses`). |
| 404 | El recurso o la ruta no existen. |
| 409 | El pedido es válido pero choca con el estado actual (borrar algo en uso, cambiar una planta muerta o regalada). |
| 422 | El JSON está bien formado pero algún campo no cumple las reglas (falta, tipo incorrecto, valor fuera de la lista, referencia a una especie o zona que no existe). |
| 500 | Error inesperado del servidor. No se muestra el detalle. |

## Paginación

`GET /plantas` devuelve la lista paginada. Parámetros: `page` (desde 1, por defecto 1) y `limit` (por defecto 10). Tienen que ser enteros mayores a 0, si no da 400.

```json
{ "datos": [ ... ], "pagina": 1, "limite": 10, "total": 13, "totalPaginas": 2 }
```

## Salud

`GET /api/v1/salud` → **200** `{ "ok": true }`. Sirve para ver que el servidor está levantado.

---

## Especies

Una especie define cuánta luz necesita y cada cuántos días se riega y se abona.

```json
{
  "nombreComun": "Ficus",
  "nombreCientifico": "Ficus lyrata",
  "luz": "media",
  "frecuenciaRiegoDias": 7,
  "frecuenciaAbonoDias": 30
}
```

Reglas: `nombreComun` obligatorio; `nombreCientifico` opcional (texto o null); `luz` es `baja`, `media` o `alta`; las frecuencias son enteros mayores a 0.

| Verbo | Ruta | Descripción | Status |
|---|---|---|---|
| GET | `/especies` | Lista todas. Filtro opcional `?luz=alta`. | 200 |
| GET | `/especies/:id` | Una especie. | 200, 404 |
| POST | `/especies` | Crea una especie. Devuelve el header `Location`. | 201, 400, 422 |
| PUT | `/especies/:id` | Reemplaza la especie entera (se mandan todos los campos). | 200, 400, 404, 422 |
| DELETE | `/especies/:id` | Borra la especie. | 204, 404, 409 si hay plantas de esa especie |

## Zonas

Lugares de la casa donde están las plantas.

```json
{ "nombre": "Terraza", "luz": "alta", "interior": false }
```

Reglas: `nombre` obligatorio; `luz` es `baja`, `media` o `alta`; `interior` es `true` o `false`.

| Verbo | Ruta | Descripción | Status |
|---|---|---|---|
| GET | `/zonas` | Lista todas. Filtro opcional `?interior=true` o `false`. | 200 |
| GET | `/zonas/:id` | Una zona. | 200, 404 |
| POST | `/zonas` | Crea una zona. Devuelve `Location`. | 201, 400, 422 |
| PUT | `/zonas/:id` | Reemplaza la zona. | 200, 400, 404, 422 |
| DELETE | `/zonas/:id` | Borra la zona. | 204, 404, 409 si tiene plantas |

## Plantas

Cada planta es de una especie y está en una zona.

```json
{
  "apodo": "Ramona",
  "especieId": "<id de una especie>",
  "zonaId": "<id de una zona>",
  "fechaCompra": "2026-03-15"
}
```

Reglas: `apodo` obligatorio; `especieId` y `zonaId` tienen que existir (si no, 422); `fechaCompra` es una fecha real `AAAA-MM-DD`.

El `estado` puede ser `activa`, `en_recuperacion`, `muerta` o `regalada`. Una planta nueva arranca `activa` y el estado solo se cambia con PATCH. Una planta `muerta` o `regalada` ya no cambia de estado (409).

El detalle (`GET /plantas/:id`) agrega `salud`, que se calcula en el momento mirando el último riego contra la frecuencia de la especie:

```json
"salud": { "estado": "atrasada", "diasSinRiego": 6, "diasAtraso": 3 }
```

`estado` es `al_dia` o `atrasada`. Si la planta está muerta o regalada, `salud` es `null`.

| Verbo | Ruta | Descripción | Status |
|---|---|---|---|
| GET | `/plantas` | Lista paginada. Filtros opcionales: `zonaId`, `especieId`, `estado`, más `page` y `limit`. | 200, 400 |
| GET | `/plantas/:id` | Una planta con su `salud`. | 200, 404 |
| POST | `/plantas` | Crea una planta (estado `activa`). Devuelve `Location`. | 201, 400, 422 |
| PUT | `/plantas/:id` | Reemplaza apodo, especie, zona y fecha. Conserva el estado. | 200, 400, 404, 422 |
| PATCH | `/plantas/:id` | Cambia el estado. Cuerpo: `{ "estado": "en_recuperacion" }`. | 200, 400, 404, 409, 422 |
| DELETE | `/plantas/:id` | Borra la planta y todos sus cuidados. | 204, 404 |

## Cuidados

Sub-recurso de una planta: `/plantas/:id/cuidados`. Si la planta no existe, cualquier pedido da 404.

```json
{ "tipo": "riego", "fecha": "2026-10-20", "nota": "con agua de lluvia" }
```

Reglas: `tipo` es `riego`, `abono`, `poda` o `trasplante`; `fecha` es opcional (si no viene se usa la de hoy) y no puede ser futura; `nota` es opcional.

| Verbo | Ruta | Descripción | Status |
|---|---|---|---|
| GET | `/plantas/:id/cuidados` | Cuidados de la planta, del más nuevo al más viejo. Filtro opcional `?tipo=riego`. | 200, 404 |
| GET | `/plantas/:id/cuidados/:cuidadoId` | Un cuidado. Si es de otra planta también da 404. | 200, 404 |
| POST | `/plantas/:id/cuidados` | Registra un cuidado. Devuelve `Location`. | 201, 400, 404, 409 si la planta está muerta o regalada, 422 |
| DELETE | `/plantas/:id/cuidados/:cuidadoId` | Borra un cuidado (por si se cargó mal). | 204, 404 |

## Reportes

Solo lectura: se calculan en el momento con los datos actuales.

| Verbo | Ruta | Descripción | Status |
|---|---|---|---|
| GET | `/reportes/riegos-pendientes` | Plantas vivas con el riego atrasado, agrupadas por zona (orden alfabético) y la más atrasada primero. Las zonas al día no aparecen. | 200 |
| GET | `/reportes/cuidados-por-mes` | Cantidad de cuidados por mes y por tipo de los últimos `meses` meses, incluido el actual. `?meses=` entre 1 y 24, por defecto 6. Los meses sin cuidados salen en 0. | 200, 400 |

Ejemplo de `riegos-pendientes`:

```json
[
  { "zona": "Baño", "pendientes": [ { "plantaId": "...", "apodo": "Rulo", "diasAtraso": 3 } ] }
]
```

Ejemplo de una fila de `cuidados-por-mes`:

```json
{ "mes": "2026-10", "total": 14, "porTipo": { "riego": 11, "abono": 3, "poda": 0, "trasplante": 0 } }
```

## Otros detalles

- Las respuestas de más de 1 KB se comprimen con gzip si el cliente manda `Accept-Encoding: gzip`.
- Una ruta que no existe (por ejemplo `POST /reportes/riegos-pendientes`) responde 404 con el mismo formato de error.
