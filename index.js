"use strict";

const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card, Suggestion } = require("dialogflow-fulfillment");

const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://YOUR_CLOUD_FIREBASE_ID.firebaseio.com'
});

process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });

    function bodyMassIndex(agent) {
      let weight = request.body.queryResult.parameters.weight;
      let height = request.body.queryResult.parameters.height / 100;
      let bmi = (weight / (height * height));
      let result = "none";

      if (bmi < 18.5) {
        result = "xs";
      } else if (bmi >= 18.5 && bmi <= 22.9) {
        result = "s";
      } else if (bmi >= 23 && bmi <= 24.9) {
        result = "m";
      } else if (bmi >= 25 && bmi <= 29.9) {
        result = "l";
      } else if (bmi > 30) {
        result = "xl";
      }

      return admin.firestore().collection('bmi').doc(result).get().then(doc => {
        agent.add(doc.data().description);
      });
    }

    let intentMap = new Map();
    intentMap.set("0 Menu - BMI - custom - yes", bodyMassIndex);
    agent.handleRequest(intentMap);
  }
);
