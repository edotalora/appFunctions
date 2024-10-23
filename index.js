/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

//const {onRequest} = require("firebase-functions/v2/https");
//const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

/* exports.grantModeratorRole = v1.https.onRequest(async (request, response) => {
    debugger;
    console.log(admin);
    const email = request.params[0];
    const authUser = await admin.auth().getUserByEmail("testing@hmail.com");
    return authUser;
  }); */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
const https = require("https");
const handler = cors({ origin: true });

const serviceAccount = require("./appointapp3-firebase-adminsdk-gc9p3-38e4f4af6c.json");
const { request } = require("http");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.addAdminRole = functions.https.onRequest(async (request, response) => {
  const email = request.params[0];
  const authUser = await admin.auth().getUserByEmail(email);
  admin.auth().setCustomUserClaims(authUser.uid, { admin: true });
  console.log("adminRole...", authUser.customClaims);
  response.send(authUser);
});

exports.addUserRole = functions.https.onRequest(async (request, response) => {
  const email = request.params[0];
  console.log("user mail...", email);
  const authUser = await admin.auth().getUserByEmail(email);
  admin.auth().setCustomUserClaims(authUser.uid, { admin: false });
  console.log("nonAdminRole...", authUser.customClaims);
  response.send(authUser);
});

exports.userClaims = functions.https.onRequest(async (request, response) => {
  const email = request.params[0];
  const authUser = await admin.auth().getUserByEmail(email);
  console.log("userClaims...", authUser.customClaims);
  response.send(authUser);
});

exports.testEnv = functions.https.onRequest(async (request, response) => {
  const value = `el valor de la env variable es ${process.env.SECRET}`;
  response.send(value);
});

exports.verifyToken = functions.https.onRequest((request, response) => {
  cors()(request, response, async () => {
    const captchaToken = request.params[0];
    console.log("captcha token value...", captchaToken);
    const siteVerifyURL = `${process.env.VALIDATE_TOKEN_URL}?secret=${process.env.SECRET_KEY}&response=${captchaToken}`;
    const res = await fetch(siteVerifyURL);
    const headerDate =
      res.headers && res.headers.get("date")
        ? res.headers.get("date")
        : "no response date";
    console.log("Status Code:", res.status);
    console.log("Date in Response header:", headerDate);

    const tokenVerificationResult = await res.json();

    return response.json({
      status: "ok",
      verificationResult: tokenVerificationResult,
    });
  });
});
