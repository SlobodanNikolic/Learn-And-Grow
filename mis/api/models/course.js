const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title : {
        type: String,
        minLength: 4,
        maxLength: 30,
    },
    desc : {
        type: String,
        minLength: 4,
        maxLength: 500,
    },

    segments : {
        type: [mongoose.Schema.Types.ObjectId],
        ref:'Segment'
    },

    author: {
        type: mongoose.Schema.Types.ObjectId, ref:'User'
    },

    status: {
        type: String,
        enum: ['ACTIVE', 'DELETED', 'BLOCKED'],
        default: 'ACTIVE'
    },
    
    deleted : Boolean
});

module.exports = mongoose.model('Course', courseSchema);