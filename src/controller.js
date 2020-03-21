const TO_NUMBER = "50768080024"
const NEXMO_NUMBER = "50769516094";


const Nexmo = require('nexmo');
const options = {
  debug: false,
};



module.exports.sendMessage = (req, res, message) => { 
  // Handle the controller logic
  // send the message from the service
  // await the result and return and status based on those. 

  /*nexmo.channel.send(
    { type: "sms", number: TO_NUMBER },
    { type: "sms", number: "Ytzvan" },
    {
      content: {
        type: "text",
        text: message
      }
    },
    (err, data) => {
      if (err) {
        console.log(err);
         return res.send(err);
      } else {
      console.log(data);
        return res.send(data);
      }
    }
  );*/
  
const send = true;

 if (send) {
    nexmo.message.sendSms("Ytzvan", TO_NUMBER, message, (err, responseData) => {
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
  } else {// borrar de aqui abajo
    return res.send("ok no enviado"); // borrar luego;
  } //
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
    {
      content: {
        type: "audio",
        audio: {
          url:
            "https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3"
        }
      }
    },
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