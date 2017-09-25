'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const handleMessage = require('./functions.js').handleMessage;
const sendTextMessage = require('./functions.js').sendTextMessage;
const app = express();

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Hello world, I am DorisBot');
});

// Facebook verification
app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === process.env.FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong token');
});

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry
    data.entry.forEach(function(entry) {

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log('Webhook received unknown event: ', event);
        }
      });
    });

    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var message = event.message;
  var nlp = message.nlp.entities;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    handleMessage(senderID, messageText, nlp);

  } else if (messageAttachments) {
    sendTextMessage(senderID, 'Message with attachment received');
  }
}

// Start server
app.listen(app.get('port'), function() {
  console.log('running on port', app.get('port'));
  });
