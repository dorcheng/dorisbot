const messagePairs = require('./messagePairs.json');
const levenshtein = require('fast-levenshtein');
const request = require('request');

// Returns single entity
function returnEntity(entities, name) {
  if (entities[name]) {
    return entities[name][0];
  } else {
    return null;
  }
}

// Handles message based on entity and text messages
function handleMessage(recipientId, message, entities) {
  const greeting = returnEntity(entities, 'greeting');
  const goodbye = returnEntity(entities, 'goodbye');
  const question = returnEntity(entities, 'question');
  const hobbies = returnEntity(entities, 'hobbies');
  const currentlydoing = returnEntity(entities, 'currently_doing');
  const planFoodDate = returnEntity(entities, 'schedule_food_date');
  const planHangout = returnEntity(entities, 'schedule_hangout');


  // Checks if each entity exists and entity confidence > 0.8
  if (greeting && greeting.confidence > 0.8) {

    //Response choices
    const responses = ['hi!!', 'hey! hows it going?', 'whats up'];

    // Randomize response
    let index = Math.floor(Math.random() * (responses.length + 1));
    sendTextMessage(recipientId, responses[index]);
  }

  else if (goodbye && goodbye.confidence > 0.8) {
    const responses = ['bye!!', 'okay :( byee', 'see you later!', 'talk to ya soon', 'see ya soon'];
    let index = Math.floor(Math.random() * (responses.length + 1));
    sendTextMessage(recipientId, responses[index]);
  }

  else if (question && question.confidence > 0.8 && hobbies && hobbies.confidence > 0.8) {
    const responses = ['I like hiking a lot', 'hmm roadtripping!! and going on food adventures', 'biking down steep hills', 'I like doing artsy things like arts & crafts and DIY stuff'];
    let index = Math.floor(Math.random() * (responses.length + 1));
    sendTextMessage(recipientId, responses[index]);
  }

  else if (currentlydoing && currentlydoing.confidence > 0.8) {
    if (currentlydoing.value === 'current_thought') {
      sendTextMessage(recipientId, 'how to finish my code');
    }
    if (currentlydoing.value === 'current_activity'){
      sendTextMessage(recipientId, 'coding lol');
    }
  }

  else if (planFoodDate && planFoodDate.confidence > 0.8) {
    const responses = ['okok', 'suree, when?', 'kk where do you wanna eat', 'YES!! where?'];
    let index = Math.floor(Math.random() * (responses.length + 1));
    sendTextMessage(recipientId, responses[index]);
  }

  else if (planHangout && planHangout.confidence > 0.8) {
    const responses = ['okok', 'suree, when?', 'kk where do you wanna eat', 'YES!! where?'];
    let index = Math.floor(Math.random() * (responses.length + 1));
    sendTextMessage(recipientId, responses[index]);
  }

  else {
    // Apply text message history to check similarity of input
    let result = checkSimilarity(message);
    sendTextMessage(recipientId, result);
  }
}

// Format reply message
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

// Check similarity of two strings by using levenshtein distance
function checkSimilarity(input) {
  const keys = Object.keys(messagePairs);
  let lowestLvl = null;
  let lowestLvlKey = null;
  for (var k = 0; k < keys.length; k++) {
    let distance = levenshtein.get(keys[k], input);
    let level = distance / Math.max(keys[k].length, input.length);
    if (level <= 0.20) {
      return messagePairs[keys[k]];
    }
    if (lowestLvl === null || lowestLvl > level) {
      lowestLvl = level;
      lowestLvlKey = keys[k];
    }
  }
  if (lowestLvl > 0.25) {
    return 'not sure what you mean o.o';
  }
  return messagePairs[lowestLvlKey];
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

module.exports = {
  handleMessage,
  sendTextMessage
};
