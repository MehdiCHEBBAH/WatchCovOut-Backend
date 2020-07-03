const express = require('express');

const router = express.Router();


var {admin} = require('../app');
const { isAdmin, isUser } = require('../auth');


/************** Global Vars ************/
const db = admin.firestore();

/************* Routes ************* */

    /**
     * Get all zones
     */
    router.get('/', /*isAdmin,*/ async(req, res)=>{
        var data = await db.collection('zones').get()
        var response = [];
        data.forEach(doc=>{
            let e = doc.data();
            e.id = doc.id;
            response.push(e);
        })
        res.status(200);
        res.send(response);
    });

    /**
     * Create a zone
     */
    router.put('/',async (req, res) => {
        try{
            var result = await db.collection('zones').add(req.body);
            res.status(200);
            res.send({
                msg: 'Created seccefully',
                id: result.id
            });
        }catch(err){
            res.status(500);
            res.send({error: err});
        }
    });

    /**
     * Update a zone
     */
    router.post('/:zone_id',async (req, res) => {
        try{
            var result = db.collection('zones').doc(req.params.zone_id).update(req.body);
            res.status(200);
            res.send({
                msg: 'updated seccefully',
                id: result.id
            });
        }catch(err){
            res.status(500);
            res.send({error: err});
        }
    });

    /**
     * Add a user to zone
     */
    router.put('/:zone_id/visits', /*isUser,*/ async (req, res)=>{
        try{
            await db.collection('zones').doc(req.params.zone_id).collection('visits').doc(`${req.query.nid}|${req.query.date}`).set({});
            res.status(200);
            res.send({message: 'Added user to zone'});
        }catch(err){
            res.status(500);
            res.send({error: err});
        }
    });

    /**
     * Get users visited zone
     */
    router.get('/:zone_id/visits', /*isUser,*/ async (req, res)=>{
        try{
            var data = await db.collection('zones').doc(req.params.zone_id).collection('visits').get();
            var response = [];
            data.forEach(doc=>{
                response.push({
                    nid: doc.id.split('|')[0],
                    date: doc.id.split('|')[1]
                });
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
