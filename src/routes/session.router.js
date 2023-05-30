const { Router } = require('express');
const { auth } = require('../middlewares/authentication.middleware')
const userManager = require('../dao/mongo/user.mongo');
const { createHash, isValidPassword } = require('../utils/bcryptHash');
const passport = require('passport');
const router = Router()

router.get('/counter', (req, res) => {
    if (req.session.counter) {
        req.session.counter++
        return res.send(`Has visitado el sitio ${req.session.counter} veces`)
    } else {
        req.session.counter = 1;
        return res.send(`Bienvenido`)
    }
})

router.get('/privada', auth, (req, res) => {
    res.send('Todo lo que esta aca solo lo ve admin logeado')
})

// router.post('/login', async (req, res) => {
//     try {
//         const { email, password } = req.body
//         const userDB = await userManager.getUserByEmail(email)
//         if (!userDB) return res.send({ status: 'error', message: 'No existe ese usuario' })

//         if (!isValidPassword(password, userDB)) return res.status(401).send({ status: 'error', message: 'El usuario o contraseña son incorrectos' });

//         req.session.user = {
//             first_name: userDB.first_name,
//             last_name: userDB.last_name,
//             email: userDB.email
//         }
//         if (email === 'adminCoder@coder.com') {
//             req.session.user.role = 'admin'
//         } else {
//             req.session.user.role = 'user'
//         }
//         res.redirect('/products')
//     } catch (error) {
//         console.log(error)
//     }
// })

router.post('/restaurarPass', async (req, res) => {
    const { email, password } = req.body

    const userDB = await userManager.getUserByEmail(email)

    if (!userDB) return res.send({ status: 'error', message: 'No existe ese usuario.' })

    userDB.password = createHash(password)
    await userDB.save()

    res.redirect('/login')
})

// router.post('/register', async (req, res) => {
//     try {
//         const { first_name, last_name, email, password } = req.body

//         const existUser = await userManager.getUserByEmail(email)
//         if (existUser) {
//             return res.send({ status: 'error', message: 'El email ya fue utilizado' })
//         }

//         const newUser = {
//             first_name,
//             last_name,
//             email,
//             password: createHash(password)
//         }

//         let resultUser = await userManager.addUser(newUser)
//         if (resultUser.ERROR) {
//             return res.status(200).send({ status: 'error', message: 'Algun campo esta vacio.' })
//         }

//         res.redirect('/login')
//     } catch (error) {
//         console.log(error)
//     }
// })

router.post('/login', passport.authenticate('login', {failureRedirect: '/api/session//failLogin'}), async (req, res) => {
    if (!req.user) return res.status(401).send({ status: 'error', message: 'invalid credencial' })
    req.session.user = {
        first_ame: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email
    }
    if (req.session.user.email === 'adminCoder@coder.com') {
        req.session.user.role = 'admin'
    } else {
        req.session.user.role = 'user'
    }
    res.redirect('/products')
})

router.get('/failLogin', async (req, res) => {
    console.log('Fallo la estrategia de Login.')
    res.send({ status: 'error', message: 'Fallo la autenticacion' })
})

router.post('/register', passport.authenticate('register', {failureRedirect: '/api/session/failRegister'}), async (req, res) => {
    res.redirect('/login')
})

router.get('/failRegister', async (req, res) => {
    console.log('Fallo la estrategia.')
    res.send({ status: 'error', message: 'Fallo la autenticacion' })
})

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send({ status: 'error', error: err })
        } else {
            res.redirect('/login')
        }
    })
})

module.exports = router