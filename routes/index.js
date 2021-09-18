const express = require('express')
const User = require('../models/User')
const router = express.Router()

router.get('/', (req, res) => {
    res.redirect('/login')
});

router.get('/login', (req, res) => {
    res.render('login')
});

router.post('/login', (req, res) => {
    res.redirect('/setup')
})

router.get('/setup', (req, res) => {
    res.render('setup')
});

router.get('/discover', (req, res) => {
    res.render('discover')
});

router.get('/place', (req, res) => {
    res.render('place')
})

router.get('/leaderboard', async(req, res) => {
    let users = await User.find().sort({ markrates: -1 })
    let response = []
    users.forEach(user => {
        let object = {}
        object.name = user.name
        object.markrates = user.markrates
        response.push(object)
    })
    res.render('leaderboard', response)
})

router.get('/profile', async(req, res) => {
    let user = await User.findOne({ access_token: req.query.access_token })
    res.render('profile', {
        name: user.name,
        email: user.email,
        markrates: user.markrates,
        connections: user.connections
    })
})

module.exports = router