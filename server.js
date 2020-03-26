// server.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser'); // common.js
const Controller = require ('./src/controller');
require("dotenv").config();
const path = require("path");


// ROUTES
// ==============================================

// sample route with a route the way we're used to seeing it

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.get('/sample', function (req, res) {
  res.send('this is a sample!');
});

// get an instance of router
const router = express.Router();

router.use( (req, res, next) => { // logging middleware
  console.log(req.method, req.url);
  next();
});

router.get('/', (req, res) => {
  console.log("home");
  res.sendFile(path.join(__dirname + '/src/index.html'));
});

router.get('/send-sms', (req, res) => {
  const message = req.param('message');
  const number = req.param('number');
  Controller.makeCall(req, res, message, number);
  Controller.sendSMS(req, res, message, number);
  res.status(200).send("<h2>Calling & sms send</h2><p></p><a href='/'>Back to Home </a>");
});

router.get('/send-multisms/:message', (req, res) => {
  const message = req.param('message');
  Controller.sendMultiSMS(req, res, message);
});
router.get('/send-message/:message', (req, res) => {
  const message = req.param('message');
  Controller.sendFbMessage(req, res, message);
});

router.post('/inbound-message', (req, res) => {
   console.log("inbound hook");
   Controller.inboundMessage(req, res);
 // Controller.inboundMessage(req, res);
})

router.post('/status-message', (req, res)=> {
  console.log("status hook", req.body);
  res.status(200).end();
})

router.post("/event-call", (req, res) => {
  console.log("event-call", req.body);
  Controller.eventCall(req, res);
});

router.post("/answer-call", (req, res) => {
  console.log("answer-call", req.body);
  res.status(200).end();
});

router.post("/error-call", (req, res) => {
  console.log("error-call", req.body);
  res.status(200).end();
});

router.get("/make-call", (req, res) => {
  Controller.makeCall(req, res);
});

router.post("/delivery-sms", (req, res) => {
  console.log("delivery-sms", req.body);
  res.status(200).end();
});

router.post("/inbound-sms", (req, res) => {
  console.log("inbound-sms", req.body);
  Controller.inboundSms(req, res);
  
});
// apply the routes to our application
app.use('/', router);

// START THE SERVER
// ==============================================
app.listen(port);
console.log('Ready on port ' + port);