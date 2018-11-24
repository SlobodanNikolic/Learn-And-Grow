const mongoose = require('mongoose');

const segmentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title : {
        type: String,
        minLength: 4,
        maxLength: 30,
    },
    
    lessons : {
        type: [mongoose.Schema.Types.ObjectId],
        ref:'Lesson'
    },

    course : {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Course'
    },

    status: {
        type: String,
        enum: ['ACTIVE', 'DELETED', 'BLOCKED'],
        default: 'ACTIVE'
    },
    
    deleted : Boolean
});

module.exports = mongoose.model('Segment', segmentSchema);