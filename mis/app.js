const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/static', express.static('uploads'));

const mongoose = require('mongoose');

const userRoutes = require('./api/routes/users');
const courseRoutes = require('./api/routes/courses');
const lessonRoutes = require('./api/routes/lessons');
const segmentRoutes = require('./api/routes/segments');
const videoRoutes = require('./api/routes/videos');

mongoose.connect('mongodb://127.0.0.1:27017/lag', { useNewUrlParser: true });

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Authorization, Accept');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
});

app.use('/users', userRoutes);
app.use('/courses', courseRoutes);
app.use('/lessons', lessonRoutes);
app.use('/segments', segmentRoutes);
app.use('/videos', videoRoutes);


app.use((req, res, next) => {
    const error = new Error('Not found');
    res.status(404);
    next(error);
})

app.use((error, req, res, next) => {
    console.log("App.js error: " + error.message);
    res.status(500).json({
        error: {
            message: "App: " + error.message
        }
    });
});

module.exports = app;