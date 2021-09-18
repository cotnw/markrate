const express = require('express')
const axios = require('axios')
const querystring = require('querystring')
const LoginWithTwitter = require('login-with-twitter')
const router = express.Router()

let globalTokenSecret = ''

const tw = new LoginWithTwitter({
    consumerKey: process.env.TWITTER_API_KEY,
    consumerSecret: process.env.TWITTER_API_SECRET,
    callbackUrl: `http://localhost:3000/auth/twitter/callback`
})

router.get('/ig', async(req, res) => {
    res.redirect(`https://api.instagram.com/oauth/authorize?client_id=514589912963868&redirect_uri=https://bd1f0ee9ae77.ngrok.io/auth/ig/callback&scope=user_profile,user_media&response_type=code`)
});

router.get('/ig/callback', (req, res) => {
    axios.post(`https://api.instagram.com/oauth/access_token`, querystring.stringify({
        'client_id': '514589912963868',
        'client_secret': process.env.INSTAGRAM_CLIENT_ID,
        'code': req.query.code.split('#_')[0],
        'redirect_uri': `https://bd1f0ee9ae77.ngrok.io/auth/ig/callback`,
        'grant_type': 'authorization_code'
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(async response => {
        let longLivedResponse = await axios.get(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_ID}&access_token=${response.data.access_token}`)
        console.log(longLivedResponse.data)
        res.redirect(`/setup?igAccessToken=${longLivedResponse.data.access_token}&igUserId=${response.data.user_id}`)
    }).catch(error => {
        res.send(error.response.data)
    })
});

router.get('/twitter', async(req, res) => {
    tw.login((err, tokenSecret, url) => {
        if (err) {
            console.log(err)
        }
        globalTokenSecret = tokenSecret
        res.redirect(url)
    })
})

router.get('/twitter/callback', async(req, res) => {
    tw.callback({
        oauth_token: req.query.oauth_token,
        oauth_verifier: req.query.oauth_verifier
    }, globalTokenSecret, async(err, user) => {
        if (err) {
            console.log(err)
        }
        globalTokenSecret = ''
        res.redirect(`/setup?twitterToken=${user.userToken}&twitterUserId=${user.userId}&twitterUsername=${user.userName}&twitterTokenSecret=${user.userTokenSecret}`)
    });
});

module.exports = router