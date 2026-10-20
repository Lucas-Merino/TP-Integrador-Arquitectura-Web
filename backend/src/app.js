import express from 'express'
import { manejarErrores } from './middlewares/manejarErrores.js'
import { rutaNoEncontrada } from './middlewares/rutaNoEncontrada.js'
import rutasEspecies from './rutas/especies.js'
import rutasZonas from './rutas/zonas.js'

const app = express()

// para poder leer el body de los pedidos que vienen en JSON
app.use(express.json())

// ruta simple para chequear que el servidor responde
app.get('/api/v1/salud', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/v1/especies', rutasEspecies)
app.use('/api/v1/zonas', rutasZonas)

// estos dos van siempre al final, despues de todas las rutas
app.use(rutaNoEncontrada)
app.use(manejarErrores)

export default app
