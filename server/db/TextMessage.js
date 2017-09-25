const Sequelize = require('sequelize');
const db = new Sequelize(
  process.env.DATABASE_URL || 'postgres://localhost:5432/dorisbot', {
    logging: false
  }
);

const TextMessage = db.define('textMessage', {
  message: {
    type: Sequelize.TEXT
  },
  response: {
    type: Sequelize.TEXT
  }
});

module.exports = TextMessage;
