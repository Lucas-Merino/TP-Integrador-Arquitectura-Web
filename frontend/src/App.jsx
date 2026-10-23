import { useState } from 'react'
import Encabezado from './componentes/Encabezado.jsx'
import Plantas from './paginas/Plantas.jsx'

// por ahora no hay router: con un estado alcanza para dos pantallas
function App() {
  const [seccion, setSeccion] = useState('plantas')

  return (
    <>
      <Encabezado seccion={seccion} onCambiar={setSeccion} />

      <main className="contenido">
        {seccion === 'plantas' && <Plantas />}

        {seccion === 'reportes' && (
          <section>
            <h2>Reportes</h2>
            <p className="aviso">Acá van los riegos pendientes y los cuidados por mes (paso 13).</p>
          </section>
        )}
      </main>

      <footer className="pie">
        <p>TPI Arquitectura Web · Lucas Merino · 2026</p>
      </footer>
    </>
  )
}

export default App
