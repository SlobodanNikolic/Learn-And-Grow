const mongoose = require('mongoose');

const videoSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title : {
        type: String,
        minLength: 4,
        maxLength: 40,
    },
    
    desc : String,
    lessonId : mongoose.Schema.Types.ObjectId,
    courseId : mongoose.Schema.Types.ObjectId,
    segmentId: mongoose.Schema.Types.ObjectId,
    path: String,
    status: {
        type: String,
        enum: ['ACTIVE', 'DELETED', 'BLOCKED'],
        default: 'ACTIVE'
    },
    
    deleted : Boolean
});

module.exports = mongoose.model('Video', videoSchema);