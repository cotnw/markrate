const express = require('express')
const Twitter = require('twitter')
const axios = require('axios')
const User = require('../models/User')
const router = express.Router()

const twitter = new Twitter({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});


router.post('/tweet', async(req, res) => {
    let user = await User.findOne({ access_token: req.query.access_token })
    if (user) {
        twitter.get(`statuses/show/${req.body.tweetLink.split('/')[5]}`, async(err, tweet, response) => {
            let today = new Date()
            var yesterday = new Date(today.getTime());
            yesterday.setDate(today.getDate() - 1);
            let date = new Date(tweet.created_at)
            if (tweet.user.id_str == user.connections.twitter.user_id) {
                console.log(2)
            }
            if (tweet.text.includes(req.body.localBusiness) && tweet.user.id_str == user.connections.twitter.user_id && date > yesterday) {
                user.markrates = user.markrates + (20 * (tweet.user.followers_count))
                await user.save()
                res.redirect('/profile')
            } else {
                res.redirect('/verify/tweet')
            }
        })
    } else {
        res.json({ success: false, message: 'User not found' })
    }
});

router.post('/post', async(req, res) => {
    let user = await User.findOne({ access_token: req.query.access_token })
    if (user) {
        let postDetails = await axios.get(`https://api.instagram.com/oembed/?url=${req.body.postLink}`)
        if (postDetails.data.title.includes(req.body.localBusiness) && postDetails.data.author_id == user.connections.instagram.user_id) {
            let profileResponse = await axios.get(`https://graph.instagram.com/me?access_token=${user.connections.instagram.access_token}`)
            let profile = profileResponse.data
            user.markrates = user.markrates + (20 * (profile.followers))
            await user.save()
            res.redirect('/profile')
        } else {
            res.redirect('/verify/post')
        }
    } else {
        res.json({ success: false, message: 'User not found' })
    }
})


router.get('/post', (req, res) => {
    res.render('verify/post')
})

router.get('/tweet', (req, res) => {
    res.render('verify/tweet')
})

module.exports = router