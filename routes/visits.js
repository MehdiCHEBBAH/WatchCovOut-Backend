const express = require("express");
const axios = require("axios");
var admin = require("firebase-admin");
var config = require("../config.json");
const e = require("express");
const { query } = require("express");

const router = express.Router();

admin.initializeApp(
  {
    credential: admin.credential.cert(require(config.FIREBASE_CREDENTIALS)),
    databaseURL: config.DATABASE_URL,
  },
  "visits"
);

/************** Global Vars ************/
const db = admin.firestore();

/************* Routes ************* */

// get best visits for a place in a given date
router.get("/best", async (req, res) => {
  let locationId = req.query.locationId;
  let date = req.query.date;
  console.log("location is ===>" + locationId + date);

  let result = [];
  db.collection("places")
    .doc(locationId)
    .collection("visits")
    .doc(date)
    .collection("time")
    .get()
    .then(async (timesSnapshot) => {
      if (!timesSnapshot.empty) {
        timesSnapshot.forEach(async (doc) => {
          let timeId = doc.id;
          let numberOfVisitors = doc.data().numberOfVisitors;
          let time = doc.data().time;

          result.push({
            timeId,
            numberOfVisitors,
            time,
          });
        });
        // sort the result
        result.sort(function (a, b) {
          return a.numberOfVisitors > b.numberOfVisitors ? 1 : -1;
        });
        res.status(200).send(result);
      } else {
        res.status(400).send({ error: "no data found" });
      }
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

// get all users of a specific visit
router.get("/:placeId/allusers", async (req, res) => {
  let { placeId } = req.params;
  let date = req.query.date;
  let time = req.query.time;
  // TODO : build the comparison timestamp :compDate
  let compDate;

  let result = [];
  try {
    console.log("flutter");
    let snapshot = await db
      .collection("places")
      .doc(placeId)
      .collection("visits")
      .doc(date)
      .collection("time")
      .doc(time)
      .collection("people")
      .get()
      .then(async (snapshot) => {
        //console.log(snapshot.data());
        console.log("done");
        if (!snapshot.empty) {
          // await Promise.all(snapshot.map(async (doc) => {
          //   let userId = doc.id;
          //   console.log("user id is ==>"+ userId)
          //   //get the user data
          //    let user = await db.collection('users').doc(userId).get().then(async user =>{
          //     let myData = user.data();
          //     console.log(myData)
          //     result.push({
          //       userId,
          //       myData,
          //     });
          //   })
          //   c
          // }));
          snapshot.forEach(async (doc) => {
            let userId = doc.id;
            console.log("user id is ==>" + userId);
            let myData = doc.data();
            console.log(myData);
            result.push({
              userId,
              myData,
            });

            // todo: could not wait for data in forEach loop , fix this later
            //get the user data
            //  let user = await db.collection('users').doc(userId).get().then(async user =>{
            //   let myData = user.data();
            //   console.log(myData)
            //   result.push({
            //     userId,
            //     myData,
            //   });
            // })
          });

          res.status(200).send(result);
        } else {
          res.status(404).send({ error: "no data found" });
        }
      });
  } catch (error) {
    return res.status(500).send({ error: "Internal server Error" });
  }
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
