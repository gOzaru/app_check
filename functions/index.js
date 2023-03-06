const master = require("firebase-admin");
const functionName = process.env.K_SERVICE;
const config = {
  apiKey: "AIzaSyDPRWD5jBQTi4jF7Dt_hEhYCLfQlpJq3Iw",
  database: "https://meeting-room777-default-rtdb.firebaseio.com",
  projectId: "meeting-room777",
  storageBucket: "meeting-room777.appspot.com",
};
master.initializeApp(config);

const server00 = require("./sign_up");

if (!functionName || functionName === "ServerSignUp") {
  exports.ServerSignUp = server00.SignUp;
}
