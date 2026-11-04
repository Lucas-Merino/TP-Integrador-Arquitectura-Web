import express from 'express'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { manejarErrores } from './middlewares/manejarErrores.js'
import { rutaNoEncontrada } from './middlewares/rutaNoEncontrada.js'
import rutasEspecies from './rutas/especies.js'
import rutasZonas from './rutas/zonas.js'
import rutasPlantas from './rutas/plantas.js'
import rutasReportes from './rutas/reportes.js'

const app = express()

// para poder leer el body de los pedidos que vienen en JSON
app.use(express.json())

app.use('/api/v1/especies', rutasEspecies)
app.use('/api/v1/zonas', rutasZonas)
app.use('/api/v1/plantas', rutasPlantas)
app.use('/api/v1/reportes', rutasReportes)

// en produccion el mismo Express sirve el frontend compilado (npm run build).
// en desarrollo esa carpeta no existe y el front lo sirve Vite
const carpetaDist = fileURLToPath(new URL('../../frontend/dist', import.meta.url))

if (existsSync(carpetaDist)) {
  app.use(express.static(carpetaDist))
}

// estos dos van siempre al final, despues de todas las rutas
app.use(rutaNoEncontrada)
app.use(manejarErrores)

export default app
