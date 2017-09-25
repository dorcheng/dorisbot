const fs = require('fs');
var yaml = require('js-yaml');
var levenshtein = require('fast-levenshtein');

// Declare document and messagePairs
let doc;
let messagePairs = {};

// Parse yaml document of 30309 text messages (896249 words; two years of data) and convert into json object
try {
  doc = yaml.safeLoad(fs.readFileSync('./data/textData.yaml', 'utf8'));
  doc = doc.sms.slice(0, 30309);
} catch (e) {
  console.log(e);
}

let newKey = ''; // key is the message
let newValue = ''; // value is response
let prevType = 0;

// Get rid of strings that are similar to size down data set
for (var i = 0; i < doc.length; i++) {
  let currType = doc[i]._type;
  let currBody = doc[i]._body;

  if (currType === 1) {
    //if doris just finished replying
    if (prevType === 2) {
      //add key + value to your dict
      let add = true;
      let keys = Object.keys(messagePairs);
      for (var j = 0; j < keys.length; j++) {
        let distance = levenshtein.get(keys[j], newKey);
        let level = distance / Math.max(keys[j].length, newKey.length);
        if (level < 0.25) {
          add = false;
          break;
        }
      }
      if (add) {
        messagePairs[newKey] = newValue;
      }
      //reset newKey and value
      newKey = '';
      newValue = '';
    }
    newKey = `${newKey} ${currBody}`;
  }
  if (currType === 2) {
    newValue = `${newValue} ${currBody}`;
  }
  prevType = currType;
}

// write results into file with json format
fs.writeFile('./data/messagePairs.json', JSON.stringify(messagePairs, null, 4), (err) => {
  if (err) {
      console.error(err);
      return;
  }
  console.log('Yay! Successfully created file');
});
