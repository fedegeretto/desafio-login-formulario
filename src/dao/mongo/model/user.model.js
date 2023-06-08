const { Schema, model } = require('mongoose')

const collection = 'users'

const userSchema = new Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    date_of_birth: {
        type: Date
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user'
    },
    cartId: {
        type: Schema.Types.ObjectId,
        ref: 'carts'
    }
})

userSchema.pre('findOne', function () {
    this.populate('cartId');
})

const userModel = model(collection, userSchema)

module.exports = {
    userModel
}
