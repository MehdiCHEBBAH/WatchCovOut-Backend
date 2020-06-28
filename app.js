const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const bearerToken = require('express-bearer-token');

var config = require("./config.json");


/**************** Inits ****************** */
    const app = express();


/*********** Middelwares ********* */
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bearerToken());


/*********** GLOBAL VARS ********* */
    const usersRoutes = require('./routes/users');

/* *********** routes ************ */
    app.use('/api/v0/users', usersRoutes);





// start the app
app.listen( 3000, ()=>{
    console.log('started on port 3000');
});
