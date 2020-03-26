const FROM_NUMBER = "12018498652";
const TO_NUMBER = "50768080024"
const Nexmo = require('nexmo');
const options = {
  debug: false,
};
const nexmo = new Nexmo(
  {
    'apiKey': 'e61e678a',
    'apiSecret': 'sZse0wEP5Let8BXR',
    'applicationId': 'af7e6dc7-a174-4c86-856f-49d07b9cae4f', // a7e3e111-bdb1-4e60-a866-1efebeb3cb00
    'privateKey': __dirname + "/config/private.key"
  },
  options
);
const jwt = nexmo.generateJwt();
const Numbers = [
 {'number':50768080024}
  //  , { 'number': 50766166311 }  // rafael
 // , { 'number': 14349965226 }  // Arin
  , { 'number': 12136999656 }  // rafael usa
  
]
let fbUsers = [];

let smsSubscribers = [{ 'number': 50768080024 }];

function enviarSMS (msg, number) { // this functions uses Messages API

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


function enviarMultiSMS(message) {
  let arr = [];
  let _self = this;
  console.log("message", message);
  Numbers.forEach((obj) => {
    smsSend(message, obj.number); // function responsible for send the SMS
    arr.push(obj.number);
    console.log("enviando SMS..")
  });
  return console.log("Envío completado", arr);
}

function subscribeUser(user) {
   fbUsers[0] = {'userid': user};
   return console.log("subscribed");
}

function subscribeUserPhone(number) {
  smsSubscribers.push({'number': number})
  return console.log("subscribed", smsSubscribers);
}

function smsSend(msg, number) { // this utilize the SMS API, initial way 
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
}

function callUsers(users, message) {
  console.log("calling", users);
  console.log("message", message);
  users.forEach( (user) => {
    nexmo.calls.create(
      {
        to: [
          {
            type: "phone",
            // number: 50769516094
            number: user.number
          }
        ],
        from: {
          type: "phone",
          number: FROM_NUMBER
        },
        ncco: [
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

function userConfirmedCall(number) {
  return enviarSMS("the user " + number + 'confirmed. ', TO_NUMBER);
}


function declineInvitation(phone){
  try {
  enviarSMS("Your invitation was declined. Phone: " + phone, phone);
  enviarSMS("The number " + phone + " has declined. ", TO_NUMBER); // to me
  return console.log("invitation declined");
  } catch (e) {
    console.log("error", e);
  }

}
module.exports.sendSMS = (req, res, msg, number) => { 
   enviarSMS(msg, number);
   res.status(200).send("<h2>SMS Sended</h2><p></p><a href='/'>Back to Home </a>");
  
  }

module.exports.sendFbMessage = (req, res, msg) =>  { 
  const message = {
    content: {
      type: "text",
      text: msg
    }
  };

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



}

module.exports.sendMultiSMS = (req, res, message) => {
  let arr = [];
  let _self = this;
  //console.log(enviarSMS());
  Numbers.forEach( (obj) => {
    smsSend(message, obj.number);
    arr.push(obj.number);
    console.log("sending SMS")
   }); 
   return res.status(200).send(arr); 
  }

module.exports.inboundMessage = (req, res) => {
  console.log("inbound Message", req.body.message)
  const message = req.body.message;
  const body = req.body;
  const trigger = /\bjoin me\b/i; 
  const subscribeAction = /\bsubscribe\b/i; 
  const text = req.body.message.content.text;
  const phrase = { message: "\n Please respond yes or no: ", link: "http://triptable.com/" };    // since we don't have a Nexmo number, users can't respond directly. We use link instead.
            
  console.log("🤖message: ", text);
  // event type manager
  if (subscribeAction.test(text)) {
    console.log("ready to sibscribe");
    try {
      subscribeUser(body.from.id);
      console.log("user subscribed completed: ", fbUsers);
    } catch (e) {
      console.log("error", e);
    } 
  }

  

  if (trigger.test(req.body.message.content.text)) { //Subscribe Event logic -> Move to Class based.
    console.log("ready to send Multi-sms to friend List"); // function for send multisms user
    const finalMessage = text + " " + phrase.message + phrase.link;
    console.log("finalMessage: ", finalMessage);
    try {
      console.log("sending sms to the following numbers", Numbers);
      enviarMultiSMS(finalMessage);
 //     return res.status(200).end();
    } catch (e) {
      console.log("error");
  //    return res.status(200).end();
    }
  }

  return res.status(200).end();
}

module.exports.statusMessage = (req, res) => {
  const params = Object.assign(req.query, req.body);
  return console.log(params);
};


module.exports.makeCall = (req, res) => {
  nexmo.calls.create(
    {
      to: [
        {
          type: "phone",
          // number: 50769516094
          number: 50768080024
        }
      ],
      from: {
        type: "phone",
        number: 50768080024
      },
      ncco: [
        {
          action: "talk",
          voiceName: "Conchita",
          text:
            "<speak><lang xml:lang='en-EN'><break time='1s' />Hi, your seat is confirmed, I'll see you on .</lang></speak>"
        }
      ]
    },
    (error, response) => {
      if (error) return console.error(error);
      if (response) return console.log(response);
    }
  );
}

module.exports.inboundSms = (req, res)  => {
  console.log("inbound Message", req.body.text);
  console.log("inbound sender", req.body.msisdn);
  const trigger = /\bjoin me\b/i;
  const subscribeAction = /\bsubscribe\b/i; 
  const confirmation = /\byes\b/i;
  const decline = /\bno\b/i;
  const text = req.body.text;
  const phrase = "Please respond with Yes or No if you can join me!";

  if (trigger.test(text)) { //trigger word or phrase.
    const finalMessage = text + " " + phrase;
    console.log("triggered");
    try {
      enviarMultiSMS(finalMessage); // sms
      callUsers(Numbers, text); // call 
      console.log("mesage sended to group");
    } catch (e) {
      console.log("error sending message");
    }
  }

  if (subscribeAction.test(text)) {
    console.log("ready to subscribe", req.body.msisdn);
    try {
      subscribeUserPhone(req.body.msisdn);
      console.log("user subscribed completed: ", smsSubscribers);
    } catch (e) {
      console.log("error", e);
    }
  }

  if (confirmation.test(text)) { // add logic to make call from sender ID
    console.log("Invitation confirmed, You'll receibe a sms");
    try {
     // subscribeUserPhone(req.body.msisdn);
     // smsSubscribers.push(req.body.msisdn);
     // console.log("user subscribed completed: ", smsSubscribers);
      enviarSMS("Thanks for your confirmation by sms, your seat is confirmed. Phone: " + req.body.msisdn, req.body.msisdn);
      enviarSMS("The number " + req.body.msisdn + " has confirmed by sms. ", TO_NUMBER); // to me

    } catch (e) {
      console.log("error", e);
    }
  }

  if (decline.test(text)) { // send text back
    enviarSMS("Your invitation was declined. Phone: " + req.body.msisdn, req.body.msisdn);
    enviarSMS("The number " + req.body.msisdn + " has declined. ", TO_NUMBER); // to me
    console.log("Invitation declined, sorry to hear that");
  }

  res.status(200).end();
}

module.exports.eventCall = (req, res) => {
  const phone = req.body.to;  //user phone
  if (req.body.dtmf == 1) { // call user object, input expected
    const phone = req.body.to;  //user phone
    console.log("confirmed") // send sms confirmation to 2 users
    try {
      enviarSMS("Thanks for your confirmation, your seat is confirmed. Phone: " + phone, phone); // to user
      enviarSMS("The number " + phone + " has confirmed. ", TO_NUMBER); // to me
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