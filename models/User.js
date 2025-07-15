const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username : {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email : {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password : {
        type: String,
        required: true
    },
    profilePicture: {
        type: Object,
        public_id: String,
        url: String
    },
    bio : {
        type: String,
        max: 60
    },
    pronouns : {
        type: String,
        max: 15
    },
    posts: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Post'
    }],
    comments: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Comment'
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);