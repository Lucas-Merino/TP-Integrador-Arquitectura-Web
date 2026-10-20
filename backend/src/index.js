import app from './app.js'
import { cargarSeed } from './datos/seed.js'

const PORT = process.env.PORT || 3000

// arranca siempre con el jardin de ejemplo cargado
cargarSeed()

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
