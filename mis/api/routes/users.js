const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
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
        console.log('File on path ' + filePath + ' deleted!');
    }); 
}

router.get('/id/:userId', (req, res, next) => {
    const id = req.params.userId;
    console.log("Find user by id " + id);
    User.findById(id).then(user => {
        res.status(200).json({ user: user });
    }).catch(err => {
        console.log('Error in user get: ' + err);
        res.status(400).json({ error: err });
    });
});

router.get('/', (req, res, next) => {
    console.log("Get all users");

    User.find({}).then(users => {
        res.status(200).json({ users: users });
    });
});

router.patch('/id/:userId', (req, res, next) => {
    const id = req.params.userId;
    if(id){
        console.log("Patch user with id " + id);

        User.findById(id, (err, user) => {
            if(err){
                console.log('Error in patch user by id: ' + err);
                res.status(400).json({ error: err });
            }
            else{
                for(let b in req.body){
                    user[b] = req.body[b];
                }
                user.save();
                res.json(user);
            }
        })
    }else{
        console.log('Patch user with id: id is undefined');
    }
});

router.delete('/id/:userId', (req, res, next) => {
    const id = req.params.userId;
    if(id){
        console.log("Delete user with id " + id);

        User.findById(id, (err, user) => {
            if(err){
                console.log('Error in delete user by id: ' + err);
                res.status(400).json({ error: err });
            }
            else{
                if(user != null){

                    user['status'] = 'DELETED';
                    user['deleted'] = true;

                    user.save();
                        res.json(user);
                }
            }
        })
    }else{
        console.log('Delete user with id: id is undefined');
    }
});


router.post('/register', (req, res, next) => {

    bcrypt.hash(req.body.password, 10, (err, hash) =>{
        if(err){
            return res.status(500).json({
                message: "Internal server error: failed to encrypt password",
                error: err
            });
        }
        else{

            const user = User.create({
                _id: mongoose.Types.ObjectId(),
                username: req.body.username,
                password: hash,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                yearOfBirth: req.body.yearOfBirth,
                organization: req.body.organization,
                avatar: req.body.avatar,
                description: req.body.desc,
                mainRole: req.body.mainRole,
                timeCreated: + new Date(),
                lastLogin: +new Date(),
                status: 'NEW',
                deleted: false

            }).then(user => {
                res.status(201).json({
                    message: 'User created',
                    user: user
                });
                console.log('User created: ' + user);

            }).catch(err => {
                console.log('Error in user create: ' + err);
                res.status(400).json({ error: err });
            });

        }
    });

    

});

router.post('/login', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({username: username})
    .then((obj) =>{
        if(!!obj){

            // Load hash from your password DB.
            bcrypt.compare(password, obj.password, function(err, result) {
                // res == true
                if(err){
                    return res.status(400).json({'error':'Error decrypting password.'});
                }
                if(result){
                    const token = jwt.sign({username: obj.username, _id: obj._id},
                        process.env.JWT_SECRET, {expiresIn: 60*60}); //seconds
                    res.status(200).json({'message':'success', 'token':token});
                }else{
                    
                    return res.status(401).json({'message':'Passwords dont match.'});
                }
            });

            
        }
        else{
            res.status(401).json({'message':'Unauthorized'});
        }
    })
    .catch((err)=>{
        res.status(200).json({'message':'Authorization error'});
    });
});


router.post('/uploadAvatar/id/:userId', auth, busboy, (req, res, next)=>{
    let imagePath;
    let accepted = 0;

    console.log("Uploading avatar");

    if (!fs.existsSync('uploads')) {
    // Do something
        console.log("Uploads folder does not exist. Creating one.");
        fs.mkdirSync('uploads');
    }

    if(req.userData._id != req.params.userId){
        return res.status(403).json({'message':'You dont have access to this users data'});
    }
    req.busboy.on('file', (fieldname, file, filename, encoding, mimetype)=>{
        console.log("Field name: " + fieldname + ". File name: " + filename + ". encoding:" + encoding + ". mimetype: " + mimetype);
        if(fieldname==='avatar' && ['image/jpeg', 'image/png', 'image/gif'].indexOf(mimetype) !== -1){
            console.log('Upload of ${filename}, encoding: ${encoding}, type: ${mimetype} started');
            accepted += 1;
            let ext = mimetype === 'image/png' ? '.png' : ('image/jpg'? '.jpg' : '.gif');
            let bytesReceived= 0;
            imagePath = path.join('uploads', req.params.userId + ext);
            const fstream = fs.createWriteStream(imagePath);
            file.pipe(fstream);

            file.on('data', (chunk) =>{
                bytesReceived += chunk.length;
                console.log('Received ${bytesReceived} bytes of ${filename}');
            });

            fstream.on('close', ()=>{
                console.log('Upload of "${filename}" finished');
                if(file.truncated){
                    console.log('File has been truncated!')
                }
            });
        }
        else{
            console.log('Discarding "${filename}" from field ${fieldname}');
            file.resume();
            file.on('end', ()=>{
                console.log('${filename} discarded!');
            });
        }
    });
    console.log("............");

    req.busboy.on('finish', ()=>{
        console.log("Upload finished");
        User.findById(req.params.userId, (err, user) => {
            if(err){
                console.log('Error in patch user by id, on avatar upload finish: ' + err);
                res.status(400).json({ error: err });
            }
            else{
                if(user != null){
                    let oldAvatarPath = user['avatar'];

                    if(oldAvatarPath != null && oldAvatarPath != ""){
                       deleteFile(oldAvatarPath);
                    }

                    user['avatar'] = imagePath;
                    user.save();
                    res.json(user);
                }

            }
        })
        // return res.status(201).json({'status':'Upload finished! ${accepted} files accepted.'});
    });
});

module.exports = router;



































