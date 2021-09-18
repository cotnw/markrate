const express = require('express')
const Twitter = require('twitter')
const User = require('../models/User')
const router = express.Router()

const twitter = new Twitter({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});


router.post('/tweet', async(req, res) => {
    let user = await User.findOne({ access_token: req.body.access_token })
    if (user) {
        twitter.get(`statuses/show/${req.body.tweetLink.split('/')[req.body.tweetLink.length - 1]}`, (err, tweet, response) => {
            let today = new Date()
            var yesterday = new Date(today.getTime());
            yesterday.setDate(today.getDate() - 1);
            let date = new Date(tweet.created_at)
            if (tweet.text.includes(req.body.localBusiness) && tweet.user.id_str === user.connections.twitter.userId && date > yesterday) {
                res.json({ success: true })
            }
        })
    } else {
        res.json({ success: false, message: 'User not found' })
    }
});

router.get('/post', (req, res) => {
    res.render('verify/post')
})

router.get('/tweet', (req, res) => {
    res.render('verify/tweet')
})

module.exports = router