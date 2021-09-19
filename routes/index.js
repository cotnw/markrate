const express = require('express')
const User = require('../models/User')
const router = express.Router()
const axios = require('axios')

router.get('/', (req, res) => {
    res.redirect('/login')
});

router.get('/login', (req, res) => {
    res.render('login')
});

router.post('/login', (req, res) => {
    res.redirect('/auth/google')
})

router.get('/setup', (req, res) => {
    res.render('setup')
});

router.get('/discover', async (req, res) => {
    const user = await User.findOne({ access_token: req.query.access_token })
    if(!user) {
        res.render('discover')
    }
    // const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${user.coords}&radius=10000&type=restaurant&key=${process.env.GOOGLE_MAPS_KEY}`
    // axios.get(url)
    // .then(response => {
    //     const data = response.results
    //     const place = user.address
    //     res.render('discover', {
    //         data,
    //         place,
    //         key: process.env.GOOGLE_MAPS_KEY
    //     })
    // })
    // .catch(error => { console.log(error) })
});

router.get('/place', (req, res) => {
    res.render('place')
})

router.get('/leaderboard', async (req, res) => {
    let users = await User.find({}).sort({ markrates: -1 })
    let response = []
    users.forEach(user => {
        let object = {}
        object.name = user.name
        object.markrates = user.markrates
        response.push(object)
    })
    res.render('leaderboard', response)
})

router.get('/profile', async (req, res) => {
    let user = await User.findOne({ access_token: req.query.access_token })
    res.render('profile', {
        name: user.name,
        email: user.email,
        markrates: user.markrates,
        connections: user.connections
    })
    res.render('profile')
})

router.post('/setup', async(req, res) => {
    const coords = `${req.body.coords.lat},${req.body.coords.lng}`
    const address = req.body.address
    const user = await User.findOne({ access_token: req.query.access_token })
    user.coords = coords
    user.address = address
    user.save()
    res.send('updated')
})

module.exports = router