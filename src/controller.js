const TO_NUMBER = "50768080024"
const Nexmo = require('nexmo');
const options = {
  debug: false,
};
const nexmo = new Nexmo(
  {
    'apiKey': 'e61e678a',
    'apiSecret': 'sZse0wEP5Let8BXR',
    'applicationId': '32a9e8c8-de8b-487c-9237-1051a942a83c',
    'privateKey': __dirname + "/config/key.key"
  },
  options
);

const Numbers = [
  {'number':50768080024}
 // , { 'number': 50769516094 }
]
let fbUsers = [];

async function enviarSMS  (msg, number) { // Async Way
  return new Promise( (resolve, reject) => {
     nexmo.message.sendSms("Ytzvan", number, msg, (err, responseData) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        if (responseData.messages[0]["status"] === "0") {
          console.log("Message sent successfully.");
          resolve({"status": true, "data": responseData.message });
        } else {
          resolve( { "status": false, "data": responseData.messages[0]["error-text"] });
        }
      }
    });

  } );
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

function smsSend(msg, number) { // Sync way -> use for API pourposes or without React. 
  nexmo.message.sendSms("Ytzvan", number, msg, (err, responseData) => {
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

module.exports.sendSMS = (req, res, msg, number) => { 
   const result =  enviarSMS().then( (result) => {
    return res.status(200).json(result);
   }, (error) => {
    return res.send("failed with errors", error);
   } );
  
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
    { type: "messenger", id: "162137657310378" }, // fb page id: 162137657310378
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
  const phrase = { message: "\n Please respond in the following link: ", link: "http://triptable.com/" };    // since we don't have a Nexmo number, users can't respond directly. We use link instead.
            
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