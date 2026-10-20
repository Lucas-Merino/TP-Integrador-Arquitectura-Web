import express from 'express'

const app = express()

// para poder leer el body de los pedidos que vienen en JSON
app.use(express.json())

// ruta simple para chequear que el servidor responde
app.get('/api/v1/salud', (req, res) => {
  res.json({ ok: true })
})

export default app
