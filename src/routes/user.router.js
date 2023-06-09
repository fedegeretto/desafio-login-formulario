const { Router } = require('express')
const { auth } = require('../middlewares/authentication.middleware')
const userManager = require('../dao/mongo/user.mongo.js')
const { createHash } = require('../utils/bcryptHash')
const { notLoged } = require('../middlewares/notLoged.middleware')
const router = Router()

// ------------>>>>>> GET <<<<<<------------
router.get('/', notLoged ,auth, async (req, res) => {
    try {
        let users = await userManager.getUsers()
        res.send({
            status: 'success',
            payload: users
        })
    } catch (error) {
        console.log(error)
        res.send({ status: 'error', ERROR: error })
    }
})

router.get('/user', notLoged, async (req, res) => {
    try {
        let user = await userManager.getUserByEmail(req.session.user.email)
        res.send({
            status: "Success",
            payload: user,
        });
    } catch (error) {
        console.log(error);
        res.send({ status: "error", ERROR: error });
    }
})

// ------------>>>>>> POST <<<<<<------------
router.post('/', async (req, res) => {
    try {
        let user = req.body
        const newUser = {
            first_name: user.nombre,
            last_name: user.apellido,
            email: user.email,
            date_of_birth: user.date_of_birth,
            password: user.password
        }
        let result = await userManager.addUser(newUser)
        res.status(200).send({ result })
    } catch (error) {
        console.log(error)
        res.send({ status: 'error', ERROR: error })
    }
})

// ------------>>>>>> PUT <<<<<<------------
router.put('/', async (req, res) => {
    try {
        //const { email } = req.params;
        const user = req.body;

        let userToReplace = {
            firstName: user.nombre,
            lastName: user.apellido,
            email: user.email,
            date_of_birth: user.date_of_birth,
            password: user.password ? createHash(user.password) : undefined,
        };

        let result = await userManager.updateUserByEmail(user.email, userToReplace);

        res.status(200).send({
            status: "success",
            payload: result,
        });
    } catch (error) {
        res.send({
            status: "error",
            error: error,
        });
        console.log(error);
    }
})

// ------------>>>>>> DELETE <<<<<<------------

router.delete('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;

        let result = await userManager.deleteUser(uid);

        res.status(200).send({
            status: 'success',
            payload: result,
        });
    } catch (error) {
        res.send({
            status: 'error',
            error: error,
        })
        console.log(error)
    }
})

module.exports = router