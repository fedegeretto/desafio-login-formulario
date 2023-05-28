const { Router } = require('express')
const cartManager = require('../dao/mongo/cart.mongo')
const productManager = require('../dao/mongo/product.mongo.js')
const { verifyCid, verifyPid } = require('../utils/cartValidator')

const router = Router()

// ------------>>>>>> POST <<<<<<------------
router.post('/', async (req, res) => {
    try {
        let result = await cartManager.addCart()

        if (!result || result.status === 'error') {
            return res.status(404).send({
                status: 'error',
                error: result
            })
        }
        res.status(200).send({
            status: 'success',
            payload: result
        })
    } catch (error) {
        res.status(500).send({
            status: 'ERROR',
            error: 'Ha ocurrido un error al crear el carrito'
        })
        return error
    }
})

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params

        const isValidCid = await verifyCid(cid)
        if (!isValidCid) {
            return res.status(404).send({ status: 'error', error: `No existe el carrito id ${cid}` })
        }
        const isPidValid = await verifyPid(pid)
        if (!isPidValid) {
            return res.status(404).send({
                status: 'error',
                error: `No existe el producto id ${pid}`
            })
        }

        result = await cartManager.addProduct(cid, pid)
        res.status(200).send({
            status: 'success',
            payload: result
        })
    } catch (error) {
        res.status(500).send({
            status: 'ERROR',
            error: 'Ha ocurrido un error al crear el carrito'
        })
        return error
    }
})

// ------------>>>>>> GET <<<<<<------------
router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params
        const isValidCid = await verifyCid(cid)
        if (!isValidCid) {
            return res.status(404).send({ status: 'error', error: `No existe el carrito id ${cid}` })
        }
        let cart = await cartManager.getCartById(cid)
        return res.status(200).send({
            status: 'success',
            payload: cart
        })
    } catch (error) {
        res.status(500).send({
            status: 'ERROR',
            error: 'Ha ocurrido un error al obtener el carrito'
        })
        return error
    }
})

// ------------>>>>>> DELETE <<<<<<------------
router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params

        const isValidCid = await verifyCid(cid)
        if (!isValidCid) {
            return res.status(404).send({ status: 'error', error: `No existe el carrito id ${cid}` })
        }
        const isPidValid = await verifyPid(pid)
        if (!isPidValid) {
            return res.status(404).send({
                status: 'error',
                error: `No existe el producto id ${pid}`
            })
        }
        const cart = await cartManager.getCartById(cid)
        const products = cart.product.find((producto) => producto.idProduct._id == pid)
        if (!products) {
            return res.status(404).send({
                status: 'error',
                error: `No existe el producto id ${pid} en el carrito ${cid}`
            })
        }
        const result = await cartManager.deleteProduct(cid, pid)

        res.status(200).send({
            status: 'success',
            payload: result
        })
    } catch (error) {
        res.status(500).send({
            status: 'ERROR',
            error: 'Ha ocurrido un error al borrar  el producto'
        })
    }
})

router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params

        const isValidCid = await verifyCid(cid)
        if (!isValidCid) {
            return res.status(404).send({ status: 'error', error: `No existe el carrito id ${cid}` })
        }

        const result = await cartManager.deleteProducts(cid)

        res.status(200).send({
            status: 'success',
            payload: result
        })
    } catch (error) {
        res.status(500).send({
            status: 'ERROR',
            error: 'Ha ocurrido un error al borrar  el producto'
        })
    }
})

// ------------>>>>>> PUT <<<<<<------------
router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params
        const products = req.body

        products.forEach(async (product) => {
            const validPid = await productManager.getProductById(product.idProduct)
            if (!validPid || validPid.status === 'error') {
                return res.status(404).send({ status: 'error', error: `No existe el producto id ${product.idProduct}` })
            }
        })

        const isValidCid = await verifyCid(cid)
        if (!isValidCid) {
            return res.status(404).send({ status: 'error', error: `No existe el carrito id ${cid}` })
        }

        const result = await cartManager.updateProducts(cid, products)

        res.status(200).send({
            status: 'success',
            payload: result
        })
    } catch (error) {
        res.status(500).send({
            status: 'ERROR',
            error: 'Ha ocurrido un error al borrar  el producto'
        })
    }
})

router.put('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params
        const { quantity } = req.body

        const isValidCid = await verifyCid(cid)
        if (!isValidCid) {
            return res.status(404).send({ status: 'error', error: `No existe el carrito id ${cid}` })
        }

        const isPidValid = await verifyPid(pid)
        if (!isPidValid) {
            return res.status(404).send({
                status: 'error',
                error: `No existe el producto id ${pid}`
            })
        }
        const cart = await cartManager.getCartById(cid)
        const products = cart.product.find((producto) => producto.idProduct._id == pid)
        if (!products) {
            return res.status(404).send({
                status: 'error',
                error: `No existe el producto id ${pid} en el carrito ${cid}`
            })
        }
        const result = await cartManager.updateProduct(cid, pid, quantity)

        res.status(200).send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(500).send({
            status: 'ERROR',
            error: 'Ha ocurrido un error al borrar  el producto'
        })
    }
})

module.exports = router