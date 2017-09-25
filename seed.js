const TextMessage = require('./server/db/TextMessage.js');
const messagePairs = require('./messagePairs.json');

let rows = [];

const keys = Object.keys(messagePairs);
for (var i = 0; i < keys.length; i++) {
  let entry = {
    message: keys[i],
    response: messagePairs[keys[i]]
  };
  rows.push(entry);
}

const seed = () =>
  Promise.all(rows.map(row => TextMessage.create(row)));

TextMessage.sync({force: true})
  .then(() => {
    return seed();
  })
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  });
