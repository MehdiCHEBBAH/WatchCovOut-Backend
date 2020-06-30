const express = require('express');
const bodyParser = require('body-parser');
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

    const visitsRoutes = require('./routes/visits');

    const placesRoutes = require('./routes/places');
/* *********** routes ************ */
    app.use('/api/v0/users', usersRoutes);
    app.use('/api/v0/visits', visitsRoutes);
    app.use('/api/v0/places', placesRoutes);
    
    app.get("/", (req, res) => {
        res.status(200).send("/api/v0/");
      });
    

// start the app
app.listen( process.env.PORT ||8081, ()=>{
    console.log('started on port 3000');
});

