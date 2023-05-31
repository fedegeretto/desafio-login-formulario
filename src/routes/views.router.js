const { Router } = require('express')
// const { ProductManager } = require('../dao/fileSystem/productManager')
// const path = './src/archivos/products.json'
// const manager = new ProductManager(path)
const productManager = require('../dao/mongo/product.mongo')
const cartManager = require('../dao/mongo/cart.mongo')
const { loged } = require('../middlewares/loged.middleware.js')
const { notLoged } = require('../middlewares/notLoged.middleware.js')
const { auth } = require('../middlewares/authentication.middleware.js')
const router = Router()

router.get('/', notLoged, async (req, res) => {
    try {
        const { payload } = await productManager.getProducts(15)
        console.log(payload)
        const object = {
            style: 'index.css',
            title: 'Productos de la Tienda',
            user: req.session.user,
            products: payload,
        }
        res.render('home', object)
    } catch (error) {}
})

router.get('/products', async (req, res) => {
    try {
        const { page } = req.query
        const { payload, hasPrevPage, hasNextPage, prevPage, nextPage, totalPages } = await productManager.getProducts(undefined, page)
        if (page && (page > totalPages || page <= 0 || !parseInt(page))) {
            return res.status(400).send({ status: 'error', error: 'No existe la página' })
        }
        const role = req.session.user?.role === 'admin' ? true : false
        const object = {
            style: 'index.css',
            title: 'Productos de la Tienda',
            products: payload,
            user: req.session.user,
            role: role,
            hasPrevPage,
            hasNextPage,
            prevPage,
            nextPage,
        };
        res.render('products', object)
    } catch (error) {}
})

router.get('/carts/:cid', notLoged, auth, async (req, res) => {
    try {
        const { cid } = req.params
        const role = req.session.user?.role === 'admin' ? true : false
        const cart = await cartManager.getCartById(cid)
        const object = {
            style: 'index.css',
            title: 'Productos',
            user: req.session.user,
            role: role,
            products: cart.product,
            id: cart._id,
        };
        res.render('carts', object)
    } catch (error) {}
})

router.get('/chat', notLoged, async (req, res) => {
    try {
        const role = req.session.user?.role === 'admin' ? true : false
        res.render('chat', { style: 'index.css', user: req.session.user, role: role })
    } catch (error) {}
})

router.get('/realTimeProducts', notLoged, async (req, res) => {
    const { payload } = await productManager.getProducts(20)
    const object = {
        style: 'index.css',
        title: 'Realtime Products',
        user: req.session.user,
        products: payload,
    }
    res.render('realTimeProducts', object)
})

router.get('/login', loged, async (req, res) => {
    const object = {
        style: 'index.css',
        title: 'Login',
    }
    res.render('login', object)
})

router.get('/register', loged, async (req, res) => {
    const object = {
        style: 'index.css',
        title: 'Register',
        user: req.session.user,
    }
    res.render('registerForm', object)
})

router.get('/recoveryPassword', loged, async (req, res) => {
    const object = {
        style: 'index.css',
        title: 'Recovery Password',
    }
    res.render('recoveryPassword', object);
})

router.get('/profile', notLoged, async (req, res) => {
    const object = {
        style: 'index.css',
        title: 'Login',
        user: req.session.user,
    }
    res.render('profile', object)
})

module.exports = router