import { Router } from 'express'
import * as controlador from '../controladores/reportesControlador.js'

// los reportes son solo lectura, por eso solo hay GET
const router = Router()

router.get('/riegos-pendientes', controlador.riegosPendientes)
router.get('/cuidados-por-mes', controlador.cuidadosPorMes)

export default router
