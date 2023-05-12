const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

//**** sign up logic starts ****
router.post('/register', async (req, res) => {
    //Encrypt user password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    //create user in  our database
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    })
    //saving to the database
    const result = await user.save()
    //sending response excluding the password
    const {password, ...data} = await result.toJSON()

    res.send(data)
})
//**** sign up logic ends ****

//**** login logic starts ****
router.post('/login', async (req, res) => {
    //Validate if user exists in our database
    const user = await User.findOne({email: req.body.email})
    //case 1: if user is not available(signed up)
    if (!user) {
        return res.status(404).send({
            message: 'user not found'
        })
    }
    //case 2: Password validation
    if (!await bcrypt.compare(req.body.password, user.password)) {
        return res.status(400).send({
            message: 'invalid credentials'
        })
    }
    //create token
    const token = jwt.sign({_id: user._id}, "secret")
    //storing cookies
    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    })

    res.send({
        message: 'success'
    })
})
//*** login logic ens ****

//**** fetching user logic ****             
router.get('/user', async (req, res) => {
    try {
        const cookie = req.cookies['jwt']

        const claims = jwt.verify(cookie, 'secret')

        if (!claims) {
            return res.status(403).send({
                message: 'unauthenticated'
            })
        }

        const user = await User.findOne({_id: claims._id})

        const {password, ...data} = await user.toJSON()
        //adding middleware
        // add the middleware function
        router.use(function (user, req, res, next) {
             res.status(200).send(data);
        });
    } catch (e) {
        return res.status(403).send({
            message: 'unauthenticated'
        })
    }
})

// ** logout logic in when applying auth controller **
// router.get('/logout', function(req, res) {
//     res.status(200).send({ auth: false, token: null });
//   });

//
router.post('/logout', (req, res) => {
    res.cookie('jwt', '', {maxAge: 0})

    res.send({
        message: 'success'
    })
})

module.exports = router;
