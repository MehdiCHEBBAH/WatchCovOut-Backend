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
        const result = await db.collection('places').add(req.body);
        res.status(200);
        res.send({
            msg: 'Data added seccesfuly',
            id: result.id
        })
    });

    /**
     * get all places
     */
    router.get('/', /*isUser,*/ async(req, res)=>{
        db.collection('places').get()
        .then(data=>{
            var response = [];
            data.forEach(doc=>{
                response.push({
                    id: doc.id,
                    location: {
                        latitude: doc._fieldsProto.location.mapValue.fields.latitude.doubleValue,
                        longitude: doc._fieldsProto.location.mapValue.fields.longitude.doubleValue,
                    },
                    numberOfPlaces: doc._fieldsProto.numberOfPlaces.integerValue,
                    type: doc._fieldsProto.type.stringValue,
                    title: doc._fieldsProto.title.stringValue
                });
            })
            res.send(response);
        })
        .catch(err=>{
            res.status(500);
            res.send(err);
        });
    });

    /**
     * Create a date in a place
     */
    router.post('/:place_id/date', /*isServiceProvider,*/ async (req, res)=>{
        try{
            await db.collection('places').doc(req.params.place_id).collection('visits').doc(req.query.date).set({date: req.query.date});
            var placeDateRef = db.collection('places').doc(req.params.place_id).collection('visits').doc(req.query.date).collection('times');
            var openingTime = new Date(2020, 01, 01, 8, 00); // TODO change this to opening time
            var closingTime = new Date(2020, 01, 01, 17, 00); // TODO change this to closing time
            var time = openingTime;
            while(date.subtract(time, closingTime).toMinutes() >= 0){
                await placeDateRef.doc(date.format(time, 'HH:mm')).update({
                    numberOfVisitors: 0,
                    time: date.format(time, 'HH:mm')
                });
                time = date.addMinutes(time, 30); //TODO change this to chunks of time
            }
            res.status(200);
            res.send({msg: 'date created seccessfuly'});
        }catch(err){
            res.status(500);
            res.send({error: err});
        }
    });

    /**
     * Add a person to place
     */
    router.put('/:place_id/person', /*isUser,*/ async (req, res)=>{
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

/********************************** */

module.exports = router;
