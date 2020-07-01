const express = require('express');
const date = require('date-and-time');

var config = require("../config.json");
var {admin} = require('../app');
var {isAdmin, isUser, isServiceProvider} = require('../auth');

const router = express.Router();


/************** Global Vars ************/
const db = admin.firestore();

/************* Routes ************* */
    /**
     * Add a place
     */
    router.put('/', /*isServiceProvider,*/ async (req, res) => {
        try{
            const result = await db.collection('places').add(req.body);
            var i;
            var now = new Date();
            for(i = 0; i<=30 ; i++){
                await db
                    .collection('places').doc(result.id)
                    .collection('visits').doc(date.format(now, 'YYYY-MM-DD'))
                    .set({});
                var placeDateRef= db.collection('places').doc(result.id)
                                    .collection('visits').doc(date.format(now, 'YYYY-MM-DD'))
                                    .collection('times');
                var openingTime = new Date(2020, 01, 01, 8, 00); // TODO change this to opening time
                var closingTime = new Date(2020, 01, 01, 17, 00); // TODO change this to closing time
                var time = openingTime;
                while(date.subtract(closingTime, time).toMinutes() >= 0){
                    await placeDateRef.doc(date.format(time, 'HH:mm')).set({numberOfVisitors: 0});
                    time = date.addMinutes(time, 30); //TODO change this to chunks of time
                }
                now = date.addDays(now, 1);
            }
    
            res.status(200);
            res.send({
                msg: 'Data added seccesfuly',
                id: result.id
            })
        }catch(err){
            res.status(500);
            res.send({error: err});
        }
    });

    /**
     * get all places
     */
    router.get('/', /*isUser,*/ async(req, res)=>{
        db.collection('places').get()
        .then(data=>{
            var response = [];
            data.forEach(doc=>{
                let data = doc.data();
                
                delete data.chunksOfTime;
                data.id = doc.id;

                response.push(data);
            })
            res.send(response);
        })
        .catch(err=>{
            res.status(500);
            res.send(err);
        });
    });

    /**
     * visit a place
     */
    router.put('/:place_id/users', /*isUser,*/ async (req, res)=>{
        try{
            var placeDateTimeRef = db.collection('places').doc(req.params.place_id).collection('visits').doc(req.body.date).collection('times').doc(req.body.time);
            await placeDateTimeRef.collection('people').doc(req.body.nid).set({});
            await placeDateTimeRef.update({numberOfVisitors: admin.firestore.FieldValue.increment(1)});
            var personRef = db.collection('users').doc(req.body.nid);
            await personRef.collection('visits').doc(`${req.body.date}T${req.body.time}|${req.params.place_id}`).set({});
            res.status(200);
            res.send({msg: 'Visit reserved seccessfuly'});
        }catch(err){
            res.status(500);
            res.send({error: err});
        }
    });

    /**
     * Get users that visited a place at a given dateTime
     */
    router.get('/:place_id/users', /*isServiceProvider,*/ async (req, res)=>{
        try{
            var data = await db.collection('places')
                            .doc(req.params.place_id)
                            .collection('visits')
                            .doc(req.query.date)
                            .collection('times')
                            .doc(req.query.time)
                            .collection('people')
                            .get();
            var response = []
            data.forEach(doc=>{
                response.push(doc.id);
            });
            res.status(200);
            res.send(response);
        }catch(err){
            res.status(500);
            res.send({error: err});
        }
    });

    /**
     * Get a place
     */
    router.get('/:place_id', /*isUser,*/ async (req, res)=>{
        try{
            var data = await db.collection('places').doc(req.params.place_id).get();
            var result = data.data();
            result.id = data.id;
            res.status(200);
            res.send(result);
        }catch(err){
            res.status(500);
            res.send({error: err});
        }
    });

    /**
     * Get the best time to visit a place
     */
    router.get('/:place_id/best', /*isUser,*/ async (req, res)=>{
        try{
            var result = [];
            var response  = await db.collection("places").doc(req.params.place_id)
                                    .collection("visits").doc(req.query.date)
                                    .collection("times").orderBy('numberOfVisitors').get();
                response.forEach( doc => {
                    result.push({
                        time: doc.id,
                        numberOfVisitors: doc.data().numberOfVisitors
                    });
                });
                res.status(200).send(result);
        }catch(err){
            res.status(500);
            res.send({error: err});
        }
    });
/********************************** */

module.exports = router;
