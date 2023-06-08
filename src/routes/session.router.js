const { Router } = require('express');
const { auth } = require('../middlewares/authentication.middleware')
const userManager = require('../dao/mongo/user.mongo');
const { createHash, isValidPassword } = require('../utils/bcryptHash');
const passport = require('passport');
const { notLoged }= require('../middlewares/notLoged.middleware')
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
    res.send('Solo lo ve admin logeado')
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

router.post(
    "/login",
    passport.authenticate("login", {
        failureRedirect: "/api/session/failLogin",
    }),
    async (req, res) => {
        if (!req.user) return res.status(401).send({ status: "error", message: "credenciales invalidas" });
        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            date_of_birth: req.user.date_of_birth.toLocaleDateString("es-AR", { timeZone: "UTC" }),
            role: req.user.role,
            cartId: req.user.cartId
        };
        // if (req.session.user.email === "adminCoder@coder.com") {
        //     req.session.user.role = "admin";
        // } else {
        //     req.session.user.role = "user";
        // }
        //res.send({ status: "succes", message: "User registed" });
        res.redirect("/products");
    }
)

router.get("/failLogin", async (req, res) => {
    console.log("fallo la estrategia de login.");
    res.send({ status: "error", message: "Fallo la autenticacion" });
});

router.post('/register', passport.authenticate('register', {failureRedirect: '/api/session/failRegister'}), async (req, res) => {
    res.redirect('/login')
})

router.get('/failRegister', async (req, res) => {
    console.log('Fallo la estrategia.')
    res.send({ status: 'error', message: 'Fallo la autenticacion' })
})

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), async (req, res) => {
    req.session.user = req.user;
    // if (req.session.user.email === "adminCoder@coder.com") {
    //     req.session.user.role = "admin";
    // } else {
    //     req.session.user.role = "user";
    // }
    //console.log("reqUser", req.user);
    res.redirect("/products");
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send({ status: 'error', error: err })
        } else {
            res.redirect('/login')
        }
    })
})

router.get("/current", notLoged, (req, res) => {
    res.send(req.session.user);
})

module.exports = router