import express from 'express'
import createRouter from './create'
import updateRouter from './update'
import deleteRouter from './delete'

const router = express.Router()

router.use('/', createRouter)
router.use('/', updateRouter)
router.use('/', deleteRouter)

export default router
