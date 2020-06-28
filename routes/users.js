const express = require('express');
const axios = require('axios');
var admin = require("firebase-admin");

var config = require("../config.json");
const e = require('express');


const router = express.Router();
admin.initializeApp({
    credential: admin.credential.cert(require(config.FIREBASE_CREDENTIALS)),
    databaseURL: config.DATABASE_URL
});

/************** Global Vars ************/
const db = admin.firestore();

/************* Routes ************* */
router.put('/:uid',async (req, res) => {
    let snapshot = await db.collection('users').where('id', '==', req.body.nid).get();
    if(!snapshot.empty){
        admin.auth().deleteUser(req.params.uid)
        .then(function() {
            res.status(500);
            res.response({error: 'This NID already exists'});
        })
        .catch(function(error) {
            res.status(500);
            res.send({error: error});
        });
    }else{
        admin.auth().setCustomUserClaims(req.params.uid, queryObj2rolesObj(req.query)).then(() => {});
        await db.collection('users').doc(req.body.nid).set({
            isConfirmedCase: false,
            nationalCardPicURL: req.body.nationalCardPicURL,
            uid: req.params.uid
        });
    }
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
