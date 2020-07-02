const express = require('express');


var config = require("../config.json");

const router = express.Router();


var {admin} = require('../app');
const { isAdmin, isUser } = require('../auth');



/************** Global Vars ************/
const db = admin.firestore();

/************* Routes ************* */

    /**
     * Get all users
     */
    router.get('/', /*isAdmin,*/ async(req, res)=>{
        var data = await db.collection('users').get()
        var response = [];
        data.forEach(doc=>{
            let e = doc.data();
            e.nid = doc.id;
            response.push(e);
        })
        res.status(200);
        res.send(response);
    });

    /**
     * Create a user
     */
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
                    valide: false,
                    nationalCardPicURL: req.body.nationalCardPicURL,
                    uid: req.params.uid
                });
                res.status(200);
                res.send({message: 'User Created seccefully'});
            }
        });
    });


         /**
     * validate or invalidate a user
     */
    router.post('/validate/:nid', /*isUser,*/ async (req, res)=>{
        try{
            await db.collection('users').doc(req.params.nid).update({valide: req.query.valide === 'true'? true : false});
            res.status(200);
            res.send({message: 'Updated seccessfuly'});
        }catch(err){
            res.status(500);
            res.send({error: err});
        }
    });


    /**
     * make the person confirmed case
     */
    router.post('/:nid', /*isUser,*/ async (req, res)=>{
        try{
            await db.collection('users').doc(req.params.nid).update({isConfirmedCase: req.query.isConfirmedCase === 'true'? true : false});
            res.status(200);
            res.send({message: 'Updated seccessfuly'});
        }catch(err){
            res.status(500);
            res.send({error: err});
        }
    });





    /**
     * get people meeted a person in specific days
     */
    router.get('/:nid/meets', /*isAdmin,*/ async (req, res)=>{
        var dates = req.query.dates.split(',');
        var visits = await db.collection('users').doc(req.params.nid).collection('visits').get();
        var results = [];
        visits.forEach(doc=>{
            if(dates.includes(doc.id.split('T')[0])){
                results.push(doc.id);
            }
        });
        var people = {};
        for(let e of results){
            let place = e.split('|')[1];
            let day = e.split('T')[0];
            let time = e.split('T')[1].split('|')[0];

            let data = await db.collection('places')
                                .doc(place)
                                .collection('visits')
                                .doc(day)
                                .collection('times')
                                .doc(time)
                                .collection('people')
                                .get();
            data.forEach(doc=>{
                if(!(doc.id === req.params.nid)){
                    people[doc.id] = (typeof people[doc.id] === 'undefined') ? 1 : people[doc.id] + 1;
                }
            });
        }

        let response = []
        for(let e in people){
            response.push({
                nid: e,
                count: people[e]
            });
        }
        res.send(people);
    });

    /**
     * Add a notification to user
     */
    router.put('/:nid/notifications', /*isUser,*/ async (req, res)=>{
        try{
            await db.collection('users').doc(req.params.nid).collection('notifications').add(req.body);
            res.status(200);
            res.send({message: 'Added notification'});
        }catch(err){
            res.status(500);
            res.send({error: err});
        }
    });

    /**
     * Get all notifications
     */
    router.get('/:nid/notifications', /*isUser,*/ async (req, res)=>{
        try{
            var data = await db.collection('users').doc(req.params.nid).collection('notifications').get();
            var response = [];
            data.forEach(doc=>{
                let e = doc.data();
                e.id = doc.id;
                response.push(e);
            })
            res.status(200);
            res.send(response);
        }catch(err){
            res.status(500);
            res.send({error: err});
        }
    });

    /**
     * Get visits of a user
     */
    router.get("/:nid/visits", async (req, res) => {
        try{
            let snapshot = await db.collection("users").doc(req.params.nid).collection("visits").get();
            let result = [];
            snapshot.forEach((doc) => {
                result.push({
                    placeID: doc.id.split("|")[1],
                    date: doc.id.split("|")[0].split('T')[0],
                    time: doc.id.split("|")[0].split('T')[1]
                });
            });
            res.status(200)
            res.send(result);
        }catch(err){
            res.status(500)
            res.send({error: err});
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
