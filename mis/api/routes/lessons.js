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

router.get('/id/:lessonId', (req, res, next) => {
    const id = req.params.lessonId;
    console.log("Find lesson by id " + id);
    Lesson.findById(id).then(lesson => {
        res.status(200).json({ lesson: lesson });
    }).catch(err => {
        console.log('Error in lesson get: ' + err);
        res.status(400).json({ error: err });
    });
});

router.get('/', (req, res, next) => {
    console.log("Get all lessons");

    Lesson.find({}).then(lessons => {
        res.status(200).json({ lessons: lessons });
    });
});

router.patch('/id/:lessonId', (req, res, next) => {
    const id = req.params.lessonId;
    if(id){
        console.log("Patch lesson with id " + id);

        Lesson.findById(id, (err, lesson) => {
            if(err){
                console.log('Error in patch lesson by id: ' + err);
                res.status(400).json({ error: err });
            }
            else{
                for(let b in req.body){
                    lesson[b] = req.body[b];
                }
                lesson.save();
                res.json(lesson);
            }
        })
    }else{
        console.log('Patch lesson with id: id is undefined');
    }
});

router.delete('/id/:lessonId', (req, res, next) => {
    const id = req.params.lessonId;
    if(id){
        console.log("Delete lesson with id " + id);

        Lesson.findById(id, (err, lesson) => {
            if(err){
                console.log('Error in delete lesson by id: ' + err);
                res.status(400).json({ error: err });
            }
            else{
                if(lesson != null){

                    lesson['status'] = 'DELETED';
                    lesson['deleted'] = true;

                    lesson.save();
                        res.json(lesson);
                }
            }
        })
    }else{
        console.log('Delete lesson with id: id is undefined');
    }
});


router.post('/upload', auth, (req, res, next) => {
    const lesson = Lesson.create({
        _id: mongoose.Types.ObjectId(),
        title: req.body.title,
        text: req.body.text,
        courseId: req.body.courseId,
        segmentId: req.body.segmentId,
        additionalMaterials: req.body.additionalMaterials,
        video: req.body.video,
        status: req.body.status,
        deleted: req.body.deleted

    }).then(lesson => {
        res.status(201).json({
            message: 'lesson created',
            lesson: lesson
        });
        console.log('lesson created: ' + lesson);

    }).catch(err => {
        console.log('Error in lesson create: ' + err);
        res.status(400).json({ error: err });
    });
    

});

module.exports = router;



































