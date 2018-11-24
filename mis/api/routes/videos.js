const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const Lesson = require('../models/lesson');
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
const chunkSize = 1024*1024;

function deleteFile(filePath){
    fs.unlink(filePath, function (err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log('File on path ' + filePath + ' deleted!');
    }); 
}

router.get('/', (req, res, next) => {
    console.log("Get all videos");

    res.status(200).json({ message: "OK" });
});

router.get('/lessonId/:lessonId', (req, res, next) => {
    const lessonId = req.params.lessonId;
    console.log("Stream video: Find lesson by id ");
    res.status(200).json({message: "OK"});
    
    Lesson.findById(lessonId).then(lesson => {
        console.log(lesson);
        const path = lesson['video'];

        if (path === undefined || path === "" || path === null) {
            //no videos
            res.status(404).json({message: "No videos found for lesson with id " + lesson[_id]});
        }
        else{
            fs.stat(path, (err, stats) => {
            if(err){
                if(err.code == 'ENOENT'){
                    return res.status(404).json({message: 'Video not found'});
                }
                else{
                    return res.status(500).json({message: 'Unknown error', error: err});
                }
            }
            else{
                let head = {
                    'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunkSize,
                    'Content-Type': 'video/mp4'
                }

                res.writeHead(206, head);

                let fsoptions = {
                    start: start,
                    end: end
                }

                let stream = fs.createReadStream(path, fsoptions);

                stream.on('open', () =>{
                    stream.pipe(res);
                });

                stream.on('error', (err) =>{
                    return next(err);
                });
            }
        });
        }
    
        


    }).catch(err => {
        console.log('Error in stream video - find lesson by id: ' + err);
        res.status(400).json({ error: err });
    });

    
});

module.exports = router;



































