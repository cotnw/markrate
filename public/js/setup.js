const url = window.location.href
const query = url.substring(url.indexOf('?') + 1)
const query_name = query.split('=')[0]

if (query_name === 'access_token' || query_name === 'accessToken') {
    localStorage.setItem('accessToken', query.split('=')[1])
    window.location.href = '/setup'
}

if (query_name === 'twitterAuth') {
    localStorage.setItem('twitterAuth', query.split('=')[1])
    window.location.href = '/setup'
}

if (query_name === 'instaAuth') {
    localStorage.setItem('instaAuth', query.split('=')[1])
    window.location.href = '/setup'
}

const notyf = new Notyf({
    duration: 1500,
    position: { x: "right", y: "bottom" },
});

document.getElementById('setup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const instaAuth = localStorage.getItem('instaAuth')
    const twitterAuth = localStorage.getItem('twitterAuth')
    const location = document.getElementById('location').value
    if (location.trim().length === 0) {
        return notyf.error('Please enter a location.')
    }
    if (instaAuth !== 'true' && twitterAuth !== 'true') {
        return notyf.error('Please connect atleast one social.')
    }

    fetch(`https://open.mapquestapi.com/geocoding/v1/address?key=crii51WOVIIPfThLN5u02uDuhTajcIAv&location=${location}`)
    .then(async (res) => {
        const resp = await res.json()
        const address = resp.results[0].providedLocation.location
        const coords = resp.results[0].locations[0].latLng
        fetch(`/setup?access_token=${localStorage.getItem('accessToken')}`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                coords,
                address
            }),
        })
        .then(response => {
            console.log(response)
            window.location.href = `/discover?access_token=${localStorage.getItem('accessToken')}`
        })
        .catch(err => console.log(err))
    })
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