import express from 'express'
import compression from 'compression'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { manejarErrores } from './middlewares/manejarErrores.js'
import { rutaNoEncontrada } from './middlewares/rutaNoEncontrada.js'
import rutasEspecies from './rutas/especies.js'
import rutasZonas from './rutas/zonas.js'
import rutasPlantas from './rutas/plantas.js'
import rutasReportes from './rutas/reportes.js'

const app = express()

// comprime las respuestas grandes (gzip) si el cliente lo acepta
app.use(compression())

// para poder leer el body de los pedidos que vienen en JSON
app.use(express.json())

// ruta simple para chequear que el servidor responde
app.get('/api/v1/salud', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/v1/especies', rutasEspecies)
app.use('/api/v1/zonas', rutasZonas)
app.use('/api/v1/plantas', rutasPlantas)
app.use('/api/v1/reportes', rutasReportes)

// en produccion el mismo Express sirve el frontend compilado (npm run build).
// en desarrollo esa carpeta no existe y el front lo sirve Vite
const carpetaDist = fileURLToPath(new URL('../../frontend/dist', import.meta.url))

if (existsSync(carpetaDist)) {
  // los archivos de assets/ llevan un hash en el nombre (index-a1b2c3.js):
  // si cambian, cambia el nombre, asi que se pueden cachear un anio sin miedo
  app.use('/assets', express.static(`${carpetaDist}/assets`, {
    immutable: true,
    maxAge: '1y',
  }))

  // el resto (index.html, favicon) se revalida siempre para no quedar con una version vieja
  app.use(express.static(carpetaDist, {
    setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache'),
  }))

  // cualquier GET que no sea de la API devuelve el index.html
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache')
    res.sendFile(`${carpetaDist}/index.html`)
  })
}

// estos dos van siempre al final, despues de todas las rutas
app.use(rutaNoEncontrada)
app.use(manejarErrores)

export default app
