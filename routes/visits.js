const express = require("express");
var config = require("../config.json");

const router = express.Router();

var {admin} = require('../app');

/************** Global Vars ************/
const db = admin.firestore();

/************* Routes ************* */

// get best visits for a place in a given date
router.get("/best", async (req, res) => {
  let locationId = req.query.placeId;
  let date = req.query.date;

  var result = [];
  db.collection("places")
    .doc(locationId)
    .collection("visits")
    .doc(date)
    .collection("times")
    .orderBy('numberOfVisitors', 'desc')
    .get()
    .then( timesSnapshot => {
        timesSnapshot.forEach( doc => {
          let time = doc.id;
          let numberOfVisitors = doc.data().numberOfVisitors;

          result.push({
            time,
            numberOfVisitors
          });
        });
    
        res.status(200).send(result);
    });
});

// get all visits per single user
router.get("/user/:userId", async (req, res) => {
  let { userId } = req.params;
  console.log(userId);
  let snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("visits")
    .get();
  console.log("done");
  if (snapshot.empty) {
    return res.status(400).send({
      error: "Bad Request , userId does not exist",
    });
  }
  let result = [];
  snapshot.forEach(async (doc) => {
    console.log(doc.id, "=>", doc.data());
    let items = doc.id.split("|");
    let date = items[0];
    let placeId = items[1];

    console.log(date);
    console.log(placeId);
    let mydata = {};
    let place = await db
      .collection("places")
      .doc("PUSrL1LFKn6GNeZZnh7u")
      .get()
      .then(async (place) => {
        mydata.date = date;
        mydata.place = place.data();
        console.log(mydata);
        result.push({
          id: doc.id,
          data: mydata,
        });
        res.status(200).send(result);
      });
  });
});

// choose a time and date for visiting
router.post("/choose/:placeId", async (req, res) => {
  console.log("choose");
  let { placeId } = req.params;
  let date = req.query.date;
  let time = req.query.time;
  let userId = req.body.userId;

  console.log("userId ==>" + userId);

  try {
    let visitRef = db
      .collection("places")
      .doc(placeId)
      .collection("visits")
      .doc(date)
      .collection("time")
      .doc(time)
      .collection("people")
      .doc(userId);
    let result1 = await visitRef.set({});

    let userRef = db.collection("users").doc(userId).collection('visits').doc(date+"T"+time+'|'+ placeId);
    let result2 = await userRef.set({});
    return res
      .status(201)
      .send({ message: "visit choosen with seccess", result: {result1, result2} });
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: "Internal server Error"+ error });
  }
});

module.exports = router;
