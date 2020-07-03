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
    const placesRoutes = require('./routes/places');
    const zonesRoutes = require('./routes/zones');
    
/* *********** routes ************ */
    app.use('/api/v0/users', usersRoutes);
    app.use('/api/v0/places', placesRoutes);
    app.use('/api/v0/zones', zonesRoutes);
    
    app.get("/", (req, res) => {
        res.status(200).send("/api/v0/");
      });
    

      let port = 8081
// start the app
app.listen( process.env.PORT || port, ()=>{
    console.log(`started on port ${process.env.PORT || port}`);
});

