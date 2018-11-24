const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username : {
        type: String,
        minLength: 4,
        maxLength: 22,
    },
    password : {
        type: String,
        minLength: 8,
        maxLength: 30,
        validate: {
            validator: function(v){
                return /.*[A-Z].*/g.test(v) && /.*[a-z].*/g.test(v) && /.*[0-9].*/g.test(v);
            },
            message: props => 'Password must be 8-30 characters, containing at least one uppercase letter, lowercase letter, and a digit.'
        }
    },
    email : String,
    firstName : String,
    lastName : String,
    avatar : String,
    yearOfBirth : Number,
    organization : String,
    avatar : String,
    description : String,
    mainRole : {
        type: String,
        enum:['ADMIN', 'MODERATOR', 'STUDENT', 'TEACHER'],
        default: 'STUDENT'
    },
    rolesMap :{
        type: Map,
        of: String
    },
    timeCreated: Date,
    lastLogIn: Date,
    status: {
        type: String,
        enum: ['NEW', 'ACTIVE', 'DELETED', 'BLOCKED'],
        default: 'NEW'
    },
    coursesAuthor:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Course'
    },
    deleted : Boolean
});

module.exports = mongoose.model('User', userSchema);