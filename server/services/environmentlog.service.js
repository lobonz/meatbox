'use strict';
const logger = require('winston');
const EnvironmentLog = require('../models/environmentlog_schema');

async function createEnvironmentLog(newlog) {
  // Creates initial EnvironmentLog
  const environmentlog = new EnvironmentLog(newlog);
  // save environmentlog
    await environmentlog.save();
    return { environmentlogid: environmentlog._id }
  }

// Fetch all envionment logs
async function readEnvironmentLog(userParam) {
  var options = {
    page: parseInt(userParam.page) || 1,
    limit: parseInt(userParam.limit) || 10
  }
  var search = {}
  //Likely search will need to be based on dateCreated
  var dt = new Date(); //Milliseconds since 1970 of course
  var MS_PER_MINUTE = 60000;//milliseonds per second
  var MS_PER_HOUR = MS_PER_MINUTE * 60;//milliseonds per minute
  var MS_PER_DAY = MS_PER_HOUR * 24;//milliseonds per hour

  var timespandays = 0;
  var timespanhours = 1;
  var timespanminutes = 0;
  var timespan = MS_PER_DAY * timespandays + MS_PER_HOUR * timespanhours + MS_PER_MINUTE * timespanminutes

  var fromTime = new Date(Date.now() - timespan);
  //var fromTime = dt.setHours(dt.getHours() - 2);

  return await EnvironmentLog.find({createdAt : { $gte : fromTime} }, function(error, docs){
    if(error){
      throw new Error(error)
    } else {
      return docs
    }
  });
  
  // return await EnvironmentLog.paginate(search, options, function(error, docs) {
  //   // result.docs
  //   // result.total
  //   // result.limit - 10
  //   // result.page - 3
  //   // result.pages
  //   if(error){
  //     throw new Error(error)
  //   } else {
  //     return docs
  //   }
  // })

}

module.exports = {
  createEnvironmentLog,
  readEnvironmentLog
};




