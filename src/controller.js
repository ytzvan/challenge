const TO_NUMBER = "50768080024"
const Nexmo = require('nexmo');
const options = {
  debug: false,
};
const nexmo = new Nexmo(
  {
    'apiKey': "3ea30bb8",
    'apiSecret': "fzvpjQaLwn4qnNI6",
    'applicationId': "5934f30e-521a-46e1-b2eb-aabf0ee66170",
    'privateKey': __dirname + "/config/key.key"
  },
  options
);

const Numbers = [
  {'number':50769516094},
  { 'number': 50768080024 },
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
    //smsSend(message, obj.number);
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
  console.log("inbound Message", req.body.message_uuid)
  const body = req.body;
  const trigger = /\bjoin me\b/i
  const text = req.body.message.content.text;
  // event type manager
  if (req.body.message.content.text == "subscribe" || "Subscribe") { //Subscribe Event logic -> Move to Class based.
    console.log("user subscribed"); // function for subscribe user
    try {
      subscribeUser(body.from.id);
      console.log(fbUsers);
    } catch (e) {
      console.log("error");
    } 
  }


  
  console.log("testing message", trigger.test(text));
  if (req.body.message.content.text == "join me" || "Join Me") { //Subscribe Event logic -> Move to Class based.
    console.log("ready to send Multi-sms to friend List"); // function for send multisms user
    try {
      console.log("sending sms to the following numbers", Numbers);
      enviarMultiSMS("este es el mensaje");
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