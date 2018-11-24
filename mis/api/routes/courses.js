const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const Lesson = require('../models/lesson');
const Course = require('../models/course');
const Segment = require('../models/segment');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('./auth');
const connectBusboy = require('connect-busboy');

const busboy = connectBusboy({
    immediate: true,
    highWaterMark: 1024 * 1024,
    limits:{
        filesize: 1024 * 1024
    }
});

const fs = require('fs');
const path = require('path');

function deleteFile(filePath){
    fs.unlink(filePath, function (err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log('File on path '+ filePath +' deleted!');
    }); 
}

router.get('/id/:courseId', (req, res, next) => {
    const id = req.params.courseId;
    console.log("Find course by id " + id);
    Course.findById(id).then(course => {
        res.status(200).json({ course: course });
    }).catch(err => {
        console.log('Error in course get: ' + err);
        res.status(400).json({ error: err });
    });
});

router.get('/', (req, res, next) => {
    console.log("Get all courses");

    Course.find({}).then(courses => {
        res.status(200).json({ courses: courses });
    });
});

router.patch('/id/:courseId', (req, res, next) => {
    const id = req.params.courseId;
    if(id){
        console.log("Patch course with id " + id);

        Course.findById(id, (err, course) => {
            if(err){
                console.log('Error in patch course by id: ' + err);
                res.status(400).json({ error: err });
            }
            else{
                for(let b in req.body){
                    course[b] = req.body[b];
                }
                course.save();
                res.json(course);
            }
        })
    }else{
        console.log('Patch course with id: id is undefined');
    }
});

router.delete('/id/:courseId', (req, res, next) => {
    const id = req.params.courseId;
    if(id){
        console.log("Delete course with id " + id);

        Course.findById(id, (err, course) => {
            if(err){
                console.log('Error in delete course by id: ' + err);
                res.status(400).json({ error: err });
            }
            else{
                if(course != null){

                    course['status'] = 'DELETED';
                    course['deleted'] = true;

                    course.save();
                        res.json(course);
                }
            }
        })
    }else{
        console.log('Delete course with id: id is undefined');
    }
});


router.post('/upload', auth, (req, res, next) => {

    const course = Course.create({
        _id: mongoose.Types.ObjectId(),
        title: req.body.title,
        desc: req.body.desc,
        segments: req.body.segments,
        author: req.body.author,
        status: req.body.status,
        deleted: req.body.deleted

    }).then(course => {
        res.status(201).json({
            message: 'Course created',
            course: course
        });
        console.log('Course created: ' + course);

    }).catch(err => {
        console.log('Error in course create: ' + err);
        res.status(400).json({ error: err });
    });


    

});


module.exports = router;



































