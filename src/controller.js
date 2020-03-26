const FROM_NUMBER = "12018498652";
const TO_NUMBER = "50768080024"
const Nexmo = require('nexmo');
const options = {
  debug: false,
};
const nexmo = new Nexmo( // this can be moved to .env variables, should not be exposed. 
  {
    'apiKey': 'e61e678a',
    'apiSecret': 'sZse0wEP5Let8BXR',
    'applicationId': 'af7e6dc7-a174-4c86-856f-49d07b9cae4f', // a7e3e111-bdb1-4e60-a866-1efebeb3cb00
    'privateKey': __dirname + "/config/private.key"
  },
  options
);
const Numbers = [ // This is the array of friends which will be involved in the conversation
 {'number':50768080024}
  //  , { 'number': 50766166311 }  // rafael
 // , { 'number': 14349965226 }  // Arin
 // , { 'number': 12136999656 }  // rafael usa
  
]
let fbUsers = []; // trigger through fb messenger
let smsSubscribers = [{ 'number': 50768080024 }]; // subscribers array list, alternative to friend list

function sendUniqueSMS (msg, number) { // this functions uses beta Messages API

  const message = {
    content: {
      type: 'text',
      text: msg
    },
  };
  try {
    nexmo.channel.send(
      { type: 'sms', number: number },
      { type: 'sms', number: FROM_NUMBER },
      message,
      (err, data) => { if (err) {
        console.log("error: ", err);
       return {status: false, data: err};
      }else {
        console.log("data",data);
        return { status: true, data: data };
      } },
      { useBasicAuth: true },
      );
  } catch (e) {
       console.log("finished with errors", e);
       return { status: false, data: e };
  }
}


function sendMultipleSMS(message) {
  let arr = [];
  let _self = this;
  Numbers.forEach((obj) => {
    smsSend(message, obj.number); // function responsible for send the SMS
    arr.push(obj.number);
  });
  return console.log("Sending completed", arr);
}

function subscribeUser(user) {
   fbUsers[0] = {'userid': user};
   return console.log("subscribed");
}

function subscribeUserPhone(number) {
  smsSubscribers.push({'number': number})
  return console.log("subscribed", smsSubscribers);
}

function smsSend(msg, number) { // this functions utilizes the traditional SMS API
  try {
  nexmo.message.sendSms(FROM_NUMBER, number, msg, (err, responseData) => {
    if (err) {
      console.log(err);
      return { "status": false, "data": err }
    } else {
      if (responseData.messages[0]["status"] === "0") {
        console.log("Message sent successfully.");
        return { "status": true, "data": responseData.message };
      } else {
        return { "status": false, "data": responseData.messages[0]["error-text"] };
      }
    }
  });
  } catch (e) {
    return {"status": false, "data": e};
  }
}

function callUsers(users, message) { // This function calls a number using the Voice API and receive the input
  users.forEach( (user) => {
    nexmo.calls.create(
      {
        to: [
          {
            type: "phone",
            number: user.number
          }
        ],
        from: {
          type: "phone",
          number: FROM_NUMBER
        },
        ncco: [ // Text 2 Speech API
          {
            "action": "talk",
            "text": message,
            "voiceName": "Amy",
            "bargeIn": false
          },
          {
            "action": "talk",
            "text": "Press 1 to Confirm you can join me, or Press 2 if you cannot join me. Followed by the hash key",
            "voiceName": "Amy",
            "bargeIn": true
          },
          {
            "action": "input",
            "submitOnHash": true,
            "timeOut": 10
          },
          {
            "action": "talk",
            "text": "Thanks for your input, goodbye.",
            "voiceName": "Amy"
          }
        ]
      },
      (error, response) => {
        if (error) return console.error(error);
        if (response) return console.log(response);
      }
    );
  });
}

function userConfirmedCall(phone) { // This function handles the input from the call
  return sendUniqueSMS("the user " + phone + 'confirmed. ', TO_NUMBER);
}


function declineInvitation(phone) { // This function handles the input from the call
  try {
  sendUniqueSMS("Your invitation was declined. Phone: " + phone, phone);
  sendUniqueSMS("The number " + phone + " has declined. ", TO_NUMBER); // to me
  return console.log("invitation declined");
  } catch (e) {
    console.log("error", e);
  }

}
module.exports.sendSMS = (req, res, msg, number) => {  // This module is called by our call & sms sending web application 
   return sendUniqueSMS(msg, number);
}  

module.exports.sendFbMessage = (req, res, msg) =>  {  // this module send messages through a FB page using Messages API's
  const message = {
    content: {
      type: "text",
      text: msg
    }
  };
  try {
  nexmo.channel.send(
    { type: "messenger", id: "2878540998927156" },
    { type: "messenger", id: "885774908245264" }, // fb page id: 162137657310378
    message,
    (err, data) => {
      if (err) {
        console.log("err", err);
        res.body = { info: err.body };
      } else {
        console.log("works", data);
        res.body = { info: data };
      }
      return res.send(res.body.info);
    }
  );
  } catch (e) {
    return console.log(e);
  }
 

}

module.exports.inboundMessage = (req, res) => { // webhook controller for inbound fb messages.
  const body = req.body;
  const trigger = /\bjoin me\b/i; 
  const subscribeAction = /\bsubscribe\b/i; 
  const text = req.body.message.content.text;
  const phrase = { message: "\n Please respond yes or no: ", link: "http://google.com/" };    // since we don't have a Nexmo number, users can't respond directly. We use link instead.
            
  console.log("🤖message: ", text);

  if (subscribeAction.test(text)) { // this action subscribes the fbuui of the user. 
    console.log("ready to subscribe");
    try {
      subscribeUser(body.from.id);
      console.log("user subscribed completed: ", fbUsers);
    } catch (e) {
      console.log("error", e);
    } 
  }


  if (trigger.test(req.body.message.content.text)) { //Subscribe trigger function
    const finalMessage = text + " " + phrase.message + phrase.link; // append phrase
    try {
      sendMultipleSMS(finalMessage);
    } catch (e) {
      console.log("error");
    }
  }

  return res.status(200).end();
}

module.exports.statusMessage = (req, res) => { // status message webhook controller.
  const params = Object.assign(req.query, req.body);
  return console.log(params);
};


module.exports.makeCall = (req, res, message, phone) => { // module for making a call from Voice API. Used in the sms & call APP
  try {
  nexmo.calls.create(
    {
      to: [
        {
          type: "phone",
          number: phone
        }
      ],
      from: {
        type: "phone",
        number: FROM_NUMBER
      },
      ncco: [
        {
          action: "talk",
          voiceName: "Amy",
          text:
            message
        }
      ]
    },
    (error, response) => {
      if (error) return console.error(error);
      if (response) return console.log(response);
    }
  );
  } catch (e) {
    return console.log(e);
  }
}

module.exports.inboundSms = (req, res)  => {  // module for sms webhook
  console.log("inbound Message", req.body.text);
  console.log("inbound sender", req.body.msisdn);
  const trigger = /\bjoin me\b/i;   // trigger phrase
  const subscribeAction = /\bsubscribe\b/i; 
  const confirmation = /\byes\b/i;
  const decline = /\bno\b/i;
  const text = req.body.text;
  const phrase = "Please respond with Yes or No if you can join me!"; // phrase to append to the sms

  if (trigger.test(text)) { //trigger word or phrase.
    const finalMessage = text + " " + phrase;
    console.log("triggered");
    try {
      sendMultipleSMS(finalMessage); // function call for send sms to our friend list
      callUsers(Numbers, text); // call 
      console.log("mesage sended to frriend list");
    } catch (e) {
      console.log("error sending message", e);
    }
  }

  if (subscribeAction.test(text)) { // subscribe user number to friend list
    try {
      subscribeUserPhone(req.body.msisdn);
      console.log("user subscribed completed: ", smsSubscribers);
    } catch (e) {
      console.log("error", e);
    }
  }

  if (confirmation.test(text)) { // validate confirmation intent
    console.log("Invitation confirmed, You'll receibe a sms");
    try {
      sendUniqueSMS("Thanks for your confirmation by sms, your seat is confirmed. Phone: " + req.body.msisdn, req.body.msisdn);
      sendUniqueSMS("The number " + req.body.msisdn + " has confirmed by sms. ", TO_NUMBER); // to me

    } catch (e) {
      console.log("error", e);
    }
  }

  if (decline.test(text)) { // declination intent
    sendUniqueSMS("Your invitation was declined. Phone: " + req.body.msisdn, req.body.msisdn);
    sendUniqueSMS("The number " + req.body.msisdn + " has declined. ", TO_NUMBER); // to me
  }

  res.status(200).end();
}

module.exports.eventCall = (req, res) => {
  const phone = req.body.to;  //user phone
  if (req.body.dtmf == 1) { // call user object, input expected
    const phone = req.body.to;  //user phone
    try {
      sendUniqueSMS("Thanks for your confirmation, your seat is confirmed. Phone: " + phone, phone); // to user
      sendUniqueSMS("The number " + phone + " has confirmed. ", TO_NUMBER); // to me
    } catch (e) {
      return console.log("ended with errors", e);
    }
  }
  if (req.body.dtmf == 2) {
    console.log("sending decline sms") // send sms confirmation to 1 user
    declineInvitation(phone);
  }
  return res.status(200).end();
}