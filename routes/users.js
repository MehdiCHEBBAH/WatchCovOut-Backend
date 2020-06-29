const express = require('express');
const axios = require('axios');

var config = require("../config.json");
var {admin} = require('../app');


const router = express.Router();


/************** Global Vars ************/
const db = admin.firestore();

/************* Routes ************* */
    router.put('/:uid',async (req, res) => {
        const usersRef = db.collection('users').doc(req.body.nid);
        usersRef.get()
        .then(async (snapshot) => {
            if (snapshot.exists) {
                admin.auth().deleteUser(req.params.uid)
                .then(function() {
                    res.status(500);
                    res.send({error: `This NID already exists, We deleted this user: ${req.params.uid}`});
                })
                .catch(function(error) {
                    res.status(500);
                    res.send({error: `This NID already exists, We deleted this user: ${req.params.uid}`});
                });
            }else {
                admin.auth().setCustomUserClaims(req.params.uid, {
                    nid: req.body.nid,
                    roles: queryObj2rolesObj(req.query)
                })
                .then(() => {})
                .catch(err=>{});
                await db.collection('users').doc(req.body.nid).set({
                    isConfirmedCase: false,
                    nationalCardPicURL: req.body.nationalCardPicURL,
                    uid: req.params.uid
                });
                res.status(200);
                res.send({message: 'User Created seccefully'});
            }
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
