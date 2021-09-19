fetch(`/profile/data?access_token=${window.localStorage.getItem('accessToken')}`)
.then(async (resp) => {
    const response = await resp.json()
    document.getElementById('place').innerHTML = response.place
    document.getElementById('location').placeholder = response.place
    document.getElementById('fullName').placeholder = response.name
    document.getElementById('email').placeholder = response.email
    document.getElementById('markrates').innerHTML = response.markrates
})

window.onload = () => {
    document.getElementById('insta-auth-href').href = `/auth/ig`
    document.getElementById('twitter-auth-href').href = `/auth/twitter?access_token=${window.localStorage.getItem('accessToken')}`
    if (localStorage.getItem('instaAuth') === 'true') {
        document.getElementById('insta-social-icon').style.color = '#DE3939'
        document.getElementsByClassName('insta-connect-button')[0].id = 'connected'
        document.getElementsByClassName('insta-connect-button')[0].innerHTML = 'Connected'
    }
    if (localStorage.getItem('twitterAuth') === 'true') {
        document.getElementById('twitter-social-icon').style.color = '#00ACEE'
        document.getElementsByClassName('twitter-connect-button')[0].id = 'connected'
        document.getElementsByClassName('twitter-connect-button')[0].innerHTML = 'Connected'
    }
}