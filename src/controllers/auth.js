const User = require('../models/user')

exports.signup = async (req, res) => {
    const user = new User(req.body)
    console.log(user)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        console.log(token)
        res.status(201).json({ user, token })
    } catch (e) {
        console.log(e)
        res.status(400).json(e)
    }
}

exports.login = async (req, res) => {
    try {

        const user = await User.findByCredentials(req.body.email, req.body.password)

        const token = await user.generateAuthToken()

        res.status(200).json({ user, token })
    } catch (e) {
        res.status(400).json(e)
    }
}

exports.logout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.json()
    } catch (e) {
        res.status(500).json(e)
    }
}