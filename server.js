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

router.get('/send-sms', (req, res) => {  // Path used to send sms & call 
  const message = req.param('message');
  const number = req.param('number');
  Controller.makeCall(req, res, message, number);
  Controller.sendSMS(req, res, message, number);
  res.status(200).send("<h2>Calling & sms send</h2><p></p><a href='/'>Back to Home </a>");
});


router.get('/send-message/:message', (req, res) => { // send a message through fb page
  const message = req.param('message');
  Controller.sendFbMessage(req, res, message);
});

router.post('/inbound-message', (req, res) => { // inbound messages hook, calls inbound-message controller
   console.log("inbound hook");
   Controller.inboundMessage(req, res);
})

router.post('/status-message', (req, res)=> { // status message hook
  console.log("status hook", req.body);
  res.status(200).end();
})

router.post("/event-call", (req, res) => { // event call hook, handles input from event call
  console.log("event-call", req.body);
  Controller.eventCall(req, res);
});

router.post("/answer-call", (req, res) => { // answer call hook, logs call activity
  console.log("answer-call", req.body);
  res.status(200).end();
});

router.post("/error-call", (req, res) => { // error call hook, logs error activity
  console.log("error-call", req.body);
  res.status(200).end();
});

router.post("/delivery-sms", (req, res) => { // delivery statis hook
  console.log("delivery-sms", req.body);
  res.status(200).end();
});

router.post("/inbound-sms", (req, res) => { // inbound sms hook, calls controller ot handle logic
  console.log("inbound-sms", req.body);
  Controller.inboundSms(req, res);
  
});
// apply the routes to our application
app.use('/', router);

// START THE SERVER
// ==============================================
app.listen(port);
console.log('Ready on port ' + port);