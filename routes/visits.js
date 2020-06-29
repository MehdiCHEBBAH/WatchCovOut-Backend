const express = require('express');
const axios = require('axios');
var admin = require("firebase-admin");
var config = require("../config.json");
const e = require('express');
const { query } = require('express');


const router = express.Router();
admin.initializeApp({
    credential: admin.credential.cert(require(config.FIREBASE_CREDENTIALS)),
    databaseURL: config.DATABASE_URL
});

/************** Global Vars ************/
const db = admin.firestore();

/************* Routes ************* */

// get best visits for a place in a given date
router.get("/best", async(req,res)=>{
    let locationId = req.query.locationId
    let date = req.query.date

    let visitsSnapshot = await db.collection('places').where('id', '==', locationId).get();
    visitsSnapshot.forEach(element => {
        console.log("element===>" +element)
    });

})

// get all 
router.get("/user/:userId" , async(req ,res)=>{
    let {userId} = req.params
    let snapshot = await db.collection('users').where('id', '==', userId).get();
    if(!snapshot.empty){
        return res.status(400).send({
            error:"Bad Request , userId does not exist", 
        })
    }

    let 

})


// get all users of a specific visit
router.get("/:placeId/allusers" , async(req ,res)=>{
    let {placeId} = req.params
    let date = req.query.date
    // TODO : build the comparison timestamp :compDate
    let compDate

    let snapshot = await db.collection('places').where('id', '==', placeId).collection('visits')
    .where('id', '==', compDate).get();
})

// get all visits for a place
router.get("/:locationId" , async(req ,res)=>{
    let {placeId} = req.params

})

/:creneauId/allusers




module.exports = router;
