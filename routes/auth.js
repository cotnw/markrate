const express = require('express')
const axios = require('axios')
const querystring = require('querystring')
const User = require('../models/User')
const LoginWithTwitter = require('login-with-twitter')
const router = express.Router()

let globalTokenSecret = ''
let accessTokenForTwitter = ''

const tw = new LoginWithTwitter({
    consumerKey: process.env.TWITTER_API_KEY,
    consumerSecret: process.env.TWITTER_API_SECRET,
    callbackUrl: `http://localhost:3000/auth/twitter/callback`
})

router.get('/google', async(req, res) => {
    res.redirect(`https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=884360040700-4093n49it73naktrttlljb9ad6ga4jjo.apps.googleusercontent.com&redirect_uri=http://localhost:3000/auth/google/callback&scope=profile%20email`)
})

router.get('/google/callback', async(req, res) => {
    axios.post('https://oauth2.googleapis.com/token', querystring.stringify({
        client_id: `884360040700-4093n49it73naktrttlljb9ad6ga4jjo.apps.googleusercontent.com`,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: req.query.code,
        redirect_uri: `http://localhost:3000/auth/google/callback`,
        grant_type: `authorization_code`
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(response => {
        console.log(response.data.access_token)
        axios.get('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${response.data.access_token}` } }).then(async profileRes => {
            let user = await User.findOne({ google_id: profileRes.data.sub })
            if (user) {
                user.access_token = response.data.access_token
                await user.save()
                res.redirect(`/setup?access_token=${response.data.access_token}`)
            } else {
                let newUser = new User({
                    name: profileRes.data.name,
                    email: profileRes.data.email,
                    google_id: profileRes.data.sub,
                    access_token: response.data.access_token,
                    pfp_url: profileRes.data.picture,
                    markrates: 0
                })
                await newUser.save()
                res.redirect(`/setup?accessToken=${response.data.access_token}`)
            }
        })
    })
})

router.get('/ig', async(req, res) => {
    res.redirect(`https://api.instagram.com/oauth/authorize?client_id=514589912963868&redirect_uri=https://024ae09b7dae.ngrok.io/auth/ig/callback&scope=user_profile,user_media&response_type=code&state=${req.query.access_token}`)
});

router.get('/ig/callback', (req, res) => {
    axios.post(`https://api.instagram.com/oauth/access_token`, querystring.stringify({
        'client_id': '514589912963868',
        'client_secret': process.env.INSTAGRAM_CLIENT_ID,
        'code': req.query.code.split('#_')[0],
        'redirect_uri': `https://024ae09b7dae.ngrok.io/auth/ig/callback`,
        'grant_type': 'authorization_code'
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(async response => {
        let longLivedResponse = await axios.get(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_ID}&access_token=${response.data.access_token}`)
        let user = await User.findOne({ access_token: req.query.state })
        let profileResponse = await axios.get(`https://graph.instagram.com/me?access_token=${longLivedResponse.data.access_token}`)
        user.connections.instagram = {
            username: profileResponse.data.username,
            access_token: longLivedResponse.data.access_token,
            user_id: response.data.user_id
        }
        await User.findOneAndUpdate({ _id: user._id }, { connections: user.connections })
        res.redirect(`/setup?instaAuth=true`)
    }).catch(error => {
        res.send(error.response.data)
    })
});

router.get('/twitter', async(req, res) => {
    accessTokenForTwitter = req.query.access_token
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
        console.log(accessTokenForTwitter)
        let findUser = await User.findOne({ access_token: accessTokenForTwitter })
        console.log(findUser)
        findUser.connections.twitter = {
            access_token: user.userToken,
            user_id: user.userId,
            username: user.userName,
            token_secret: user.userTokenSecret
        }
        await User.findOneAndUpdate({ _id: findUser._id }, { connections: findUser.connections })
        accessTokenForTwitter = ''
        res.redirect(`/setup?twitterAuth=true`)
    });
});

module.exports = router