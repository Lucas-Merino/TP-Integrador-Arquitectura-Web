import { Router } from 'express'
import * as controlador from '../controladores/cuidadosControlador.js'
import { validarCuidado } from '../middlewares/validarCuidado.js'

// mergeParams para poder leer el :id de la planta que viene de la ruta de arriba
const router = Router({ mergeParams: true })

router.get('/', controlador.listar)
router.get('/:cuidadoId', controlador.obtener)
router.post('/', validarCuidado, controlador.crear)
router.delete('/:cuidadoId', controlador.eliminar)

export default router
