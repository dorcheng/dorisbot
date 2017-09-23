'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
// const Wit = require('node-wit').Wit;
// const log = require('node-wit').log;

// const client = new Wit({
//   accessToken: process.env.WIT_TOKEN,
//   logger: new log.Logger(log.DEBUG) // optional
// });

// console.log(client.message('set an alarm tomorrow at 7am'));

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

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        handleMessage(messageText, senderID);
        break;

      default:
      handleMessage(messageText, senderID);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, 'Message with attachment received');
  }
}

function firstEntity(nlp, name) {
  return nlp && nlp.entities && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
}

function handleMessage(message, recipient) {
  // check greeting is here and is confident
  const greeting = firstEntity(message.nlp, 'greeting');
  const goodbye = firstEntity(message.nlp, 'goodbye');
  const question = firstEntity(message.nlp, 'question');
  const hobbies = firstEntity(message.nlp, 'hobbies');
  console.log('HANDLEMESSAGE', greeting, goodbye, question, hobbies)

  if (greeting && greeting.confidence > 0.8) {
    sendResponse('hi!!', recipientId);
  }

  else if (goodbye && goodbye.confidence > 0.8) {
    sendResponse('byee', recipientId);
  }

  else if (question && question.confidence > 0.9 && hobbies && hobbies.confidence > 0.9) {
    sendResponse('Hmm, I like going on food adventures, eating dessert, hiking, biking, etc.', recipientId);
  }

  else {
    sendResponse('not sure what you mean', recipientId);
  }

}

function sendResponse(message, recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: 'typing_on',
    message: {
      text: message
    }
  };
  callSendAPI(messageData);
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

function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [{
            title: 'rift',
            subtitle: 'Next-generation virtual reality',
            item_url: 'https://www.oculus.com/en-us/rift/',
            image_url: 'http://messengerdemo.parseapp.com/img/rift.png',
            buttons: [{
              type: 'web_url',
              url: 'https://www.oculus.com/en-us/rift/',
              title: 'Open Web URL'
            }, {
              type: 'postback',
              title: 'Call Postback',
              payload: 'Payload for first bubble',
            }],
          }, {
            title: 'touch',
            subtitle: 'Your Hands, Now in VR',
            item_url: 'https://www.oculus.com/en-us/touch/',
            image_url: 'http://messengerdemo.parseapp.com/img/touch.png',
            buttons: [{
              type: 'web_url',
              url: 'https://www.oculus.com/en-us/touch/',
              title: 'Open Web URL'
            }, {
              type: 'postback',
              title: 'Call Postback',
              payload: 'Payload for second bubble',
            }]
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'));
});
