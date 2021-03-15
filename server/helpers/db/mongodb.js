const mongoose = require('mongoose');
var logger = require('winston');

const init = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    .catch((err) => {
      console.error('error: ' + err.stack);
      process.exit(1);
    });
  mongoose.connection.on('open', () => {
    //console.log('connected to database')
    logger.info('mongodb.js: connected to database');
    // /[^/]*$/.exec(module.id)[0] + 
  });
};

mongoose.Promise = global.Promise;

module.exports = init;
