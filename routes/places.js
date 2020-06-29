const express = require('express');
const axios = require('axios');

var config = require("../config.json");
var {admin} = require('../app');
var {isAdmin, isUser, isServiceProvider} = require('../auth');

const router = express.Router();


/************** Global Vars ************/
const db = admin.firestore();

/************* Routes ************* */
    router.put('/', isServiceProvider, async (req, res) => {
        req.body.nid = req.query.nid;
        const result = await db.collection('places').add(req.body);
          
          console.log('Added document with ID: ', result);
          
    });


/********************************** */
const queryObj2rolesObj = (query)=>{
    let roles = {
        ADMIN: false,
        SERVICE_PROVIDER: false
    };

    if(typeof query.admin !== 'undefined'){
        roles['ADMIN'] = true;
    };
    if(typeof query.serviceProvider !== 'undefined'){
        roles['SERVICE_PROVIDER'] = true;
    }

    return roles;
};

module.exports = router;
