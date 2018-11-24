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

router.get('/id/:segmentId', (req, res, next) => {
    const id = req.params.segmentId;
    console.log("Find segment by id " + id);
    Segment.findById(id).then(segment => {
        res.status(200).json({ segment: segment });
    }).catch(err => {
        console.log('Error in segment get: ' + err);
        res.status(400).json({ error: err });
    });
});

router.get('/', (req, res, next) => {
    console.log("Get all segments");

    Segment.find({}).then(segments => {
        res.status(200).json({ segments: segments });
    });
});

router.patch('/id/:segmentId', (req, res, next) => {
    const id = req.params.segmentId;
    if(id){
        console.log("Patch segment with id " + id);

        Segment.findById(id, (err, segment) => {
            if(err){
                console.log('Error in patch segment by id: ' + err);
                res.status(400).json({ error: err });
            }
            else{
                for(let b in req.body){
                    segment[b] = req.body[b];
                }
                segment.save();
                res.json(segment);
            }
        })
    }else{
        console.log('Patch segment with id: id is undefined');
    }
});

router.delete('/id/:segmentId', (req, res, next) => {
    const id = req.params.segmentId;
    if(id){
        console.log("Delete segment with id " + id);

        Segment.findById(id, (err, segment) => {
            if(err){
                console.log('Error in delete segment by id: ' + err);
                res.status(400).json({ error: err });
            }
            else{
                if(segment != null){

                    segment['status'] = 'DELETED';
                    segment['deleted'] = true;

                    segment.save();
                        res.json(segment);
                }
            }
        })
    }else{
        console.log('Delete segment with id: id is undefined');
    }
});


router.post('/upload', auth, (req, res, next) => {

    const segment = Segment.create({
        _id: mongoose.Types.ObjectId(),
        title: req.body.title,
        lessons: req.body.desc,
        status: req.body.status,
        deleted: req.body.deleted,
        course: req.body.course

    }).then(segment => {
        res.status(201).json({
            message: 'Segment created',
            segment: segment
        });
        console.log('Segment created: ' + segment);

    }).catch(err => {
        console.log('Error in segment create: ' + err);
        res.status(400).json({ error: err });
    });


    

});

module.exports = router;



































