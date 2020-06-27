const express = require('express');
const bodyParser = require('body-parser');
var admin = require("firebase-admin");
const axios = require('axios');
const cors = require('cors');
const bearerToken = require('express-bearer-token');

var config = require("./config.json");


/**************** Inits ****************** */
    const app = express();

    admin.initializeApp({
        credential: admin.credential.cert(require(config.FIREBASE_CREDENTIALS)),
        databaseURL: config.DATABASE_URL
    });


/*********** Middelwares ********* */
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bearerToken());


/*********** GLOBAL VARS ********* */


/* *********** routes ************ */







// start the app
app.listen( 3000, ()=>{
    console.log('started on port 3000');
});
