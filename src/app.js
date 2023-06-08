const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const objectConfig = require('./config/objectConfig.js')
const routerApp = require('./routes')
const { Server } = require('socket.io')

const productManager = require('./dao/mongo/product.mongo.js')
const messageManager = require('./dao/mongo/messsage.mongo')

const FileStore = require('session-file-store')
const { create } = require('connect-mongo')

const { initPassport, initPassportGithub } = require('./config/passport.config.js')
const passport = require('passport')

//const { ProductManager } = require('./dao/fileSystem/productManager')
//const path = './src/archivos/products.json'
//const manager = new ProductManager(path)

const app = express()

const handlebars = require('express-handlebars')

app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser('S3CR3T0'))
app.use('/static', express.static(__dirname + '/public'))

app.use(
    session({
        store: create({
            mongoUrl: 'mongodb+srv://fgprogramacionweb:phC1ujVYslbTiDru@cluster0.ryfosoc.mongodb.net/ecommerce?retryWrites=true&w=majority',
            mongoOptions: {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
            ttl: 86400,
        }),
        secret: 'S3CR3T0',
        resave: false,
        saveUninitialized: false,
    })
)

initPassport()
initPassportGithub()
passport.use(passport.initialize())
passport.use(passport.session())

app.use(routerApp)

app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).send('Ocurrió un error')
})

const httpServer = app.listen(8080, () => {
    console.log('Escuchando puerto 8080')
})

const io = new Server(httpServer)

objectConfig.connectDB()

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado.')

    socket.on('productDelete', async (pid) => {
        const id = await productManager.getProductById(pid.id)
        if (!id || id.status === 'error') {
            return socket.emit('error', { status: 'error', message: `No se encontro el producto con id ${pid.id}` })
        }
        if (!id.error) {
            await productManager.deleteProduct(pid.id)
            const data = await productManager.getProducts()
            return io.emit('newList', data)
        }
    });

    socket.on('newProduct', async (data) => {
        let datas = await productManager.addProduct(data)
        if (datas.status === 'error') {
            let msgError
            let error = datas.error
            if (error.code === 11000) {
                msgError = `No se pudo crear el producto. Code ${error.keyValue.code} repetido.`
            } else {
                msgError = 'No se pudo crear el producto. Completa todos los campos.'
            }
            return socket.emit('productAdd', { status: 'error', message: msgError })
        }
        const newData = await productManager.getProducts()
        return io.emit('productAdd', newData)
    });

    socket.on('authenticated', (data) => {
        socket.broadcast.emit('newUserConected', data)
    });

    socket.on('message', async (data) => {
        let result = await messageManager.addMessage(data)
        let messagess = await messageManager.getMessages()
        io.emit('messageLogs', messagess)
    })
})