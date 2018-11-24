const mongoose = require('mongoose');

const lessonSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title : {
        type: String,
        minLength: 4,
        maxLength: 40,
    },
    
    text : String,
    courseId : mongoose.Schema.Types.ObjectId,
    segmentId: mongoose.Schema.Types.ObjectId,
    additionalMaterials : {
        type: [String],
        validate: {
            validator: function(v){
                if(!Array.isArray(v) || !v.length)
                    return true;

                return /([a-zA-Z0-9\/]+)(\.png|\.jpg|\.jpeg|\.gif|\.pdf)/g.test(v);
            },
            message: props => 'additionalMaterials must be .png, .jpg, .jpeg, .gif or .pdf.'
        }
    },
    video : {
        type: String,
        validate: {
            validator: function(v){
                if(!Array.isArray(v) || !v.length)
                    return true;

                return /([a-zA-Z0-9\/]+)(\.mp4)/g.test(v);
            },
            message: props => 'Videos must be in .mp4 format.'
        }
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'DELETED', 'BLOCKED'],
        default: 'ACTIVE'
    },
    
    deleted : Boolean
});

module.exports = mongoose.model('Lesson', lessonSchema);