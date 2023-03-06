/* eslint-disable max-len */
// @ts-check
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const currTime = admin.firestore.FieldValue.serverTimestamp();
const fstore = admin.firestore();
const dbMain = fstore.collection("Users");
let user = {};
let response = {};

exports.SignUp = functions.runWith({
  timeoutSeconds: 30,
  memory: "1GB",
  minInstances: 0,
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("failed-precondition", "Unauthorized User is trying to access the App.");
  }
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App-Check verified app.");
  }
  const email = context.auth.token.email;
  const uid = context.auth.uid;
  const name = context.auth.token.name;
  user = {
    name: name,
    email: email,
    uid: uid,
  };
  const activity = {
    activity: {
      active: true,
      createdAt: currTime,
      lastAccess: currTime,
    },
  };
  if (user === undefined || activity === undefined) {
    response = {
      system: "error",
      message: "Unknown request from current user signup",
      error: "Request Data Mismatched",
    };
  } else {
    // If data received does exist, then check the User in Users database
    let idDoc = "";
    await dbMain.get().then(async (output) => {
      if (output.empty) {
        // Add first User here
        idDoc = "_0" + 1 + "_";
        await dbMain.doc(idDoc).set(user);
        await dbMain.doc(idDoc).collection("Activity").doc(uid).set(activity);
      } else {
        // Check its uid
        output.forEach(async (doc) => {
          idDoc = doc.id;
          data = doc.data();
          if (user.uid === data["uid"]) {
            await dbMain.doc(idDoc).collection("Activity").doc(uid).update(activity);
            response = {
              system: "success",
              message: "User is a registered member",
            };
          } else {
            idDoc = "_0" + output.size + 1 + "_";
            await dbMain.doc(idDoc).set(user);
            await dbMain.doc(idDoc).collection("Activity").doc(uid).set(activity);
            response = {
              system: "success",
              message: "User is a new member",
            };
          }
        });
      }
    });
  }
  return Promise.resolve(response);
});
