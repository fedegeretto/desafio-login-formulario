const { Router } = require('express')
const productRouter = require('./products.router.js')
const cartRouter = require('./cart.router.js')
const viewsRouter = require('./views.router.js')
const userRouter = require('./user.router.js')
const cookieRouter = require('./pruebas.router.js')
const sessionRouter = require('./session.router.js')

const router = Router()

router.use('/', viewsRouter)
router.use('/pruebas', cookieRouter)
router.use('/api/session', sessionRouter)
router.use('/api/products', productRouter)
router.use('/api/carts', cartRouter)
router.use('/api/users', userRouter)

module.exports = router