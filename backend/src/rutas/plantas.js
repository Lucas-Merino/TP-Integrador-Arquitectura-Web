import { Router } from 'express'
import * as controlador from '../controladores/plantasControlador.js'
import { validarPlanta, validarEstado, validarListaEtiquetas } from '../middlewares/validarPlanta.js'

const router = Router()

router.get('/', controlador.listar)
router.get('/:id', controlador.obtener)
router.post('/', validarPlanta, controlador.crear)
router.put('/:id', validarPlanta, controlador.reemplazar)
router.patch('/:id', validarEstado, controlador.cambiarEstado)
router.put('/:id/etiquetas', validarListaEtiquetas, controlador.reemplazarEtiquetas)
router.delete('/:id', controlador.eliminar)

export default router
