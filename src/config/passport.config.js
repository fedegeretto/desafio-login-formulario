const passport = require('passport')
const local = require('passport-local')
const { userModel } = require('../dao/mongo/model/user.model')
const { createHash, isValidPassword } = require('../utils/bcryptHash')

const LocalStrategy = local.Strategy

const initPassport = () => {
    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email'
    }, async (req, username, password, done)=>{
        const { first_name, last_name } = req.body
        try {
            let userDB = await userModel.findOne({ email: username })
        if (userDB) return done(null, false)
            let newUser = {
                first_name,
                last_name,
                email: username,
                password: createHash(password),
            }
            let result = await userModel.create(newUser)
            return done(null, result)
        } catch (error) {
            return done('Error al obtener el usuario' + error)
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await userModel.findOne({ _id: id })
        done(null, user)
    })

    passport.use('login', new LocalStrategy({
        usernameField: 'email'
    }, async (username, password, done)=>{
        try {
            const userDB = await userModel.findOne({ email: username })
                    if (!userDB) return done(null, false)
                    if (!isValidPassword(password, userDB)) return done(null, false);
                    return done(null, userDB)
        } catch (error) {
            return done(error)
        }
    }))
}

module.exports = {
    initPassport
}