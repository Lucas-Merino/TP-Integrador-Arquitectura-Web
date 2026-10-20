import { Router } from 'express'
import * as controlador from '../controladores/especiesControlador.js'
import { validarEspecie } from '../middlewares/validarEspecie.js'

const router = Router()

router.get('/', controlador.listar)
router.get('/:id', controlador.obtener)
router.post('/', validarEspecie, controlador.crear)
router.put('/:id', validarEspecie, controlador.reemplazar)
router.delete('/:id', controlador.eliminar)

export default router
