const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema({ 
    content : {
        type: String,
        required: true,
        trim: true,
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    post : {
        type: mongoose.Schema.ObjectId,
        ref: 'Post'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', CommentSchema);