const { connect } = require('mongoose')

let url = 'mongodb+srv://fgprogramacionweb:phC1ujVYslbTiDru@cluster0.ryfosoc.mongodb.net/ecommerce?retryWrites=true&w=majority'

module.exports = {
    connectDB: () => {
        connect(url)
        console.log('Base de datos conectada')
    }
}