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
        required: true,
        default: 0,
    },
    connections: {
        type: Object,
        default: {
            instagram: {},
            twitter: {}
        }
    },
    coords: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false,
    }
})

const User = mongoose.model('User', UserSchema);

module.exports = User;