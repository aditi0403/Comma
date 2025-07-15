const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    title : {
        type: String,
        trim: true,
    },
    content : {
        type: String,
        trim: true,
    },
    author: { 
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    images: [{
        url : {
            type: String,
            required: false
        },
        public_id: {
            type: String,
            required: false
        }
    }],
    comments : [{
        type: mongoose.Schema.ObjectId,
        ref: 'Comment'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', PostSchema);