const express = require('express')
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

router.get('/dashboard', (req, res) => {
    res.render('dashboard')
});

module.exports = router