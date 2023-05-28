const { Router } = require('express')
const productManager = require('../dao/mongo/product.mongo.js')

const router = Router()

// ------------>>>>>> GET <<<<<<------------
router.get('/', async (req, res) => {
    try {
        let { limit } = req.query
        let { page } = req.query
        let { sort } = req.query
        let sortType = {}

        if (page) {
            page = parseInt(page)
        }

        if (sort === 'asc') {
            sortType = { price: 1 }
        } else if (sort === 'desc') {
            sortType = { price: -1 }
        }

        let query = {}
        if (req.query.category) {
            query = { ...query, category: req.query.category }
        }
        if (req.query.availability) {
            query = { ...query, stock: { $gt: 0 } }
        }
        let data = await productManager.getProducts(limit, page, query, sortType)

        if (((!parseInt(limit) && parseInt(limit) !== 0) || parseInt(limit) < 0) && limit !== undefined) {
            return res.status(400).send({ status: 'ERROR', error: 'limit debe ser un numero positivo' })
        }

        return res.status(200).send({
            ...data
        })
    } catch (error) {
        res.status(500).send({
            status: 'ERROR',
            error: 'Ha ocurrido un error al obtener los productos'
        })
        return error
    }
})

router.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params

        let data = await productManager.getProductById(pid)
        if (!data || data.status === 'error') return res.status(404).send({ status: 'ERROR', error: 'Not found' })
        return res.status(200).send({
            status: 'success',
            payload: data
        })
    } catch (error) {
        res.status(500).send({
            status: 'ERROR',
            error: 'Ha ocurrido un error al obtener el producto'
        })
        return error
    }
})

// ------------>>>>>> POST <<<<<<------------
router.post('/', async (req, res) => {
    try {
        let product = await req.body
        let data = await productManager.addProduct(product)
        if (data.status === 'error') {
            return res.status(404).send({
                status: 'error',
                error: data
            })
        }
        res.status(200).send({
            status: 'success',
            payload: product
        })
    } catch (error) {
        res.status(500).send({
            status: 'ERROR',
            error: 'Ha ocurrido un error al subir el productos'
        })
        return error
    }
})

// ------------>>>>>> PUT <<<<<<------------
router.put('/:pid', async (req, res) => {
    try {
        const { pid } = req.params

        let productUpdated = req.body

        let data = await productManager.updateProduct(pid, productUpdated)

        if (data.matchedCount === 0 || data.status === 'error') {
            return res.status(404).send({
                status: 'error',
                error: `No existe el producto id ${pid}`
            })
        }

        res.status(200).send({
            status: 'success',
            payload: productUpdated
        })
    } catch (error) {
        res.status(500).send({
            status: 'ERROR',
            error: 'Ha ocurrido un error al actualizar el producto'
        })
        return error
    }
})

// ------------>>>>>> DELETE <<<<<<------------
router.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params

        let result = await productManager.deleteProduct(pid)

        if (result.deletedCount === 0 || result.status === 'error') {
            return res.status(404).send({
                status: 'error',
                error: `No existe el producto id ${pid}`
            })
        }

        return res.status(200).send({
            status: 'success',
            payload: result
        })
    } catch (error) {
        res.status(500).send({
            status: 'ERROR',
            error: 'Ha ocurrido un error al Borrar el producto'
        })
        return error
    }
})

module.exports = router