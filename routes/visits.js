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
    .doc("date", "==", date)
    .collection("time")
    .get()
    .then(async (timesSnapshot) => {
      console.log("snapm   " + JSON.stringify(timesSnapshot, null, 2));
      timesSnapshot.forEach(async (doc) => {
        console.log(doc.id, "=>", doc.data());
        let timeId = doc.id;
        let numberOfVisitors = doc.data().numberOfVisitors;
        let time = doc.data().time;

        result.push({
          timeId,
          numberOfVisitors,
          time,
        });
      });

      res.status(200).send(result);
    });
  //  where('id', '>=', date).where('id', '<=', date + '~').get();
  console.log("done");
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
  // TODO : build the comparison timestamp :compDate
  let compDate;

  let snapshot = await db
    .collection("places")
    .where("id", "==", placeId)
    .collection("visits")
    .where("id", "==", compDate)
    .get();
});

// get all visits for a place
router.get("/:locationId", async (req, res) => {
  let { placeId } = req.params;
});

module.exports = router;
