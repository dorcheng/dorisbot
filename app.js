'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

app.set('port', (process.env.PORT || 5000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function (req, res) {
	res.send('Hello world, I am a chat bot');
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === process.env.FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong token');
})

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log('Webhook received unknown event: ', event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log('THIS IS THE EVENT', JSON.stringify(event))

  // console.log('Received message for user %d and page %d at %d with message:',
  //   senderID, recipientID, timeOfMessage);
  // console.log(JSON.stringify(message));

  var messageId = message.mid;
  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    handleMessage(senderID, messageText);

  } else if (messageAttachments) {
    sendTextMessage(senderID, 'Message with attachment received');
  }
}

function firstEntity(nlp, name) {
  if (nlp) {
    return nlp.entities[name][0];
  }
}

function handleMessage(recipientId, message) {
  // check greeting is here and is confident
  const greeting = firstEntity(message.nlp, 'greeting');
  const goodbye = firstEntity(message.nlp, 'goodbye');
  const question = firstEntity(message.nlp, 'question');
  const hobbies = firstEntity(message.nlp, 'hobbies');

  if (greeting && greeting.confidence > 0.8) {
    sendTextMessage(recipientId, 'hi!!');
  }

  else if (goodbye && goodbye.confidence > 0.8) {
    sendTextMessage(recipientId, 'byee');
  }

  else if (question && question.confidence > 0.9 && hobbies && hobbies.confidence > 0.9) {
    sendTextMessage(recipientId, 'Hmm, I like going on food adventures, eating dessert, hiking, biking, etc.');
  }

  else {
    sendTextMessage(recipientId, 'not sure what you mean');
  }

}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.FB_PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log('Successfully sent generic message with id %s to recipient %s',
        messageId, recipientId);
    } else {
      console.error('Unable to send message.');
      console.error(response);
      console.error(error);
    }
  });
}

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'));
});
