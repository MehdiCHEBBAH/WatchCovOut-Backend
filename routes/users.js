const express = require('express');
const axios = require('axios');
var admin = require("firebase-admin");

var config = require("../config.json");
const e = require('express');


const router = express.Router();
admin.initializeApp({
    credential: admin.credential.cert(require(`../${config.FIREBASE_CREDENTIALS}`)),
    databaseURL: config.DATABASE_URL
});

/************** Global Vars ************/
const db = admin.firestore();

/************* Routes ************* */
    router.put('/:uid',async (req, res) => {
        db.collection('users').doc(req.body.nid).get()
        .then(async (snapshot)=>{
            admin.auth().setCustomUserClaims(req.params.uid, queryObj2rolesObj(req.query)).then(() => {});
            await db.collection('users').doc(req.body.nid).set({
                isConfirmedCase: false,
                nationalCardPicURL: req.body.nationalCardPicURL,
                uid: req.params.uid
            });
            res.status(200);
            res.send({message: 'User Created seccefully'});
        })
        .catch(async (err)=>{
            admin.auth().deleteUser(req.params.uid)
            .then(function() {
                res.status(500);
                res.response({error: 'This NID already exists, We deleted this user.'});
            })
            .catch(function(error) {
                res.status(500);
                res.send({error: error});
            });
        });
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
