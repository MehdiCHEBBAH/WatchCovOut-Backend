const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const bearerToken = require('express-bearer-token');
var admin = require("firebase-admin");

var config = require("./config.json");

/**************** Inits ****************** */
    const app = express();

    admin.initializeApp({
        credential: admin.credential.cert(require(config.FIREBASE_CREDENTIALS)),
        databaseURL: config.DATABASE_URL
    });
    exports.admin = admin;


/*********** Middelwares ********* */
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bearerToken());


/*********** GLOBAL VARS ********* */
    const usersRoutes = require('./routes/users');
<<<<<<< HEAD
    const visitsRoutes = require('./routes/visits');


/* *********** routes ************ */
    app.use('/api/v0/users', usersRoutes);
    app.use('/api/v0/visits', visitsRoutes);
=======
    const placesRoutes = require('./routes/places');

/* *********** routes ************ */
    app.use('/api/v0/users', usersRoutes);
    app.use('/api/v0/places', placesRoutes);


>>>>>>> bc7b22f0405348ed325625325c782a4ceb15a763



// start the app
app.listen( 3000, ()=>{
    console.log('started on port 3000');
});

