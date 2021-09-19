const express = require('express')
const User = require('../models/User')
const router = express.Router()
const axios = require('axios');
const { response } = require('express');

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

router.get('/discover', async(req, res) => {
    const user = await User.findOne({ access_token: req.query.access_token })
    if(!user) {
        res.redirect('/login')
    } else {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${user.coords}&radius=10000&type=restaurant&key=${process.env.GOOGLE_MAPS_KEY}`
        axios.get(url)
        .then(response => {
            const data = response.data.results
            const place = user.address
            res.render('discover', {
                data,
                place,
                key: process.env.GOOGLE_MAPS_KEY
            })
        })
        .catch(error => { res.send(error) })
    }
});

router.get('/place/:placeID', (req, res) => {
    if(!req.query.place) {
        return res.redirect('/login')
    }
    const placeID = req.params.placeID
    const photoURL = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=1000' + '&photoreference=' + req.query.photoreference + '&key=' + process.env.GOOGLE_MAPS_KEY
    const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeID}&key=${process.env.GOOGLE_MAPS_KEY}`
    axios.get(url)
    .then(response => {
        const data = response.data.result
        res.render('place', {
            data,
            place: req.query.place,
            image: photoURL,
            key: process.env.GOOGLE_MAPS_KEY
        })
    })
    .catch(error => { console.log(error) })
})

router.get('/leaderboard', async(req, res) => {
    let users = await User.find({}).sort({ markrates: -1 })
    let response = []
    users.forEach(user => {
        let object = {}
        object.name = user.name
        object.markrates = user.markrates
        response.push(object)
    })
    res.render('leaderboard', { response: response })
<<<<<<< HEAD
})

router.get('/profile', async(req, res) => {
    res.render('profile')
})

router.get('/profile/data', async(req, res) => {
    const accessToken = req.query.access_token
    const user = await User.findOne({ access_token: accessToken })
    res.json({
=======
})

router.get('/profile', async(req, res) => {
    let user = await User.findOne({ access_token: req.query.access_token })
    res.render('profile', {
>>>>>>> 7f1288843b8a8946b2305e5010139a7c0de98493
        name: user.name,
        email: user.email,
        markrates: user.markrates,
        connections: user.connections,
        place: user.address
    })
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