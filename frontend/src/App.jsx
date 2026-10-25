import { useState } from 'react'
import Encabezado from './componentes/Encabezado.jsx'
import Plantas from './paginas/Plantas.jsx'
import Reportes from './paginas/Reportes.jsx'

// por ahora no hay router: con un estado alcanza para dos pantallas
function App() {
  const [seccion, setSeccion] = useState('plantas')

  return (
    <>
      <Encabezado seccion={seccion} onCambiar={setSeccion} />

      <main className="contenido">
        {seccion === 'plantas' && <Plantas />}

        {seccion === 'reportes' && <Reportes />}
      </main>

      <footer className="pie">
        <p>TPI Arquitectura Web · Lucas Merino · 2026</p>
      </footer>
    </>
  )
}

export default App
