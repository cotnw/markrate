const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    access_token: {
        type: String,
        required: true
    },
    pfp_url: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    given_name: {
        type: String,
        required: false
    },
    family_name: {
        type: String,
        required: false
    },
    google_id: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    markrates: {
        type: Number,
        required: true
    },
    connections: {
        type: Object,
        default: {
            instagram: {},
            twitter: {}
        }
    }
})

const User = mongoose.model('User', UserSchema);

module.exports = User;