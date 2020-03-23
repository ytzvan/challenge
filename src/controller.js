const TO_NUMBER = "50768080024"


const Nexmo = require('nexmo');
const options = {
  debug: false,
};

const Numbers = [
  {'number':50769516094},
  { 'number': 50768080024 },
]
// const nexmo = new Nexmo(
//   {
//     'apiKey': "3ea30bb8",
//     'apiSecret': "fzvpjQaLwn4qnNI6",
//     'applicationId': "5934f30e-521a-46e1-b2eb-aabf0ee66170",
//     'privateKey': __dirname + "/config/key.key"
//   },
//   options
// );


 function enviarSMS (msg, number) {
  const Nexmo = require('nexmo');
  const nexmo = new Nexmo(
    {
      'apiKey': "3ea30bb8",
      'apiSecret': "fzvpjQaLwn4qnNI6",
      'applicationId': "5934f30e-521a-46e1-b2eb-aabf0ee66170",
      'privateKey': __dirname + "/config/key.key"
    },
    options
  );
  nexmo.message.sendSms("Ytzvan", number, msg, (err, responseData) => {
    if (err) {
      console.log(err);
      return {"status": false, "data": err};
    } else {
      if (responseData.messages[0]["status"] === "0") {
        console.log("Message sent successfully.");
        return {"status": true, "data": responseData.message};
      } else {
       
        return { "status": false, "data": responseData.messages[0]["error-text"]}
      }
    }
  });
}
module.exports.sendSMS = (req, res, msg, number) => { 

     const nexmo = new Nexmo(
    {
      'apiKey': "3ea30bb8",
      'apiSecret': "fzvpjQaLwn4qnNI6",
      'applicationId': "5934f30e-521a-46e1-b2eb-aabf0ee66170",
      'privateKey': __dirname + "/config/key.key"
    },
    options
  );

    nexmo.message.sendSms("Ytzvan", number, msg, (err, responseData) => {
      if (err) {
        console.log(err);
      } else {
        if (responseData.messages[0]["status"] === "0") {
          console.log("Message sent successfully.");
          return res.status(200).json({ responseData: responseData });
        } else {
          console.log(
            `Message failed with error: ${responseData.messages[0]["error-text"]}`
          );
          return res
            .status(200)
            .json({ error: responseData.messages[0]["error-text"] });
        }
      }
    });
  }

module.exports.sendFbMessage = (req, res, msg) =>  {
  const nexmo = new Nexmo(
    {
      apiKey: "3ea30bb8",
      apiSecret: "fzvpjQaLwn4qnNI6",
      applicationId: "5934f30e-521a-46e1-b2eb-aabf0ee66170",
      privateKey: __dirname + "/config/key.key"
    },
    options
  );
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
    enviarSMS(message, obj.number)
    arr.push(obj.number);
  } );
  return res.send(arr);
} 

module.exports.inboundMessage = (req, res) => {
  console.log("inbound Message", req.body)
  const body = req.body;
  return res.send(body)
}

module.exports.statusMessage = (req, res) => {
  const params = Object.assign(req.query, req.body);
  return console.log(params);
};


module.exports.makeCall = (req, res) => {
  const nexmo = new Nexmo(
    {
      apiKey: "3ea30bb8",
      apiSecret: "fzvpjQaLwn4qnNI6",
      applicationId: "5934f30e-521a-46e1-b2eb-aabf0ee66170",
      privateKey: __dirname + "/config/key.key"
    },
    options
  );
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