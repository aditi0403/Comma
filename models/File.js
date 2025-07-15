const mongoose = require('mongoose');

const FileSchema = mongoose.Schema({
    url : {
        type: String,
        required: true,
    },
    public_id : {
        type: String,
        required: true,
    },
    uploaded_by: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('File', FileSchema);