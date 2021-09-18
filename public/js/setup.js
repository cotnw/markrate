document.getElementById('setup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // checks to see if user has entered location or not
    // checks to see if atleast one social is connected or not
    window.location.href = '/dashboard'
})