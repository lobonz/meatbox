// Importing required modules
const express = require('express')
const cors = require('cors')

const jwt = require('./helpers/jwt')

const multer = require("multer")
const path = require("path")
const fs = require("fs")

const stateService = require('./services/state.service')
const environmentLogService = require('./services/environmentlog.service')
var controlBoxService = require('./services/controlbox.service')

var mongoose = require('mongoose');

// parse env variables
require('dotenv').config()
const logger = require('./helpers/logger.js'); 

var CronJob = require('cron').CronJob;

require("./helpers/db/mongodb.js")()

// Make default user none exist
const userService = require('./services/user.service');
userService.checkDefaultUser()

var _state = {}
stateService.readState().then(response => {
  if (response) {
    _state = response
    logger.info('Loaded State from DB')
  } else {
    logger.error('Could not load state from DB, Please ensure Mongo is running.')
    process.exit(1)
  }
})

//controllbox
controlBoxService.connectControlBox(processControlBoxData).then(response => {
  if (response.started) {
    logger.info("Control Box Service Started")
  } else {
    logger.error('Could not start Control Box Service.')
  }
})

//sensors
// const tempHumiditySensor = require('./sensors/temp_humidity_sensor')
// const loadSensor = require('./sensors/load_sensor')
// const { Console } = require('console')

function saveState () {
  logger.debug(_state)
  try {
    _state.save(function (error) {
      if (error) {
        logger.error('Could not save state to DB: ' + error)
      } else {
        logger.info('Saved state to DB')
      }
    })
  } catch (err) {
    logger.error('Could not save state to DB, Please ensure Mongo is running.')
    //send notification
  }
}

function saveEnvironmentLog () {
  try {
    var newlog = {}
    //console.log (_state)
    newlog.temperature = _state.temperature
    newlog.humidity = _state.humidity
    newlog.light = _state.light
    newlog.cool = _state.cool
    newlog.heat = _state.heat
    newlog.humidify = _state.humidify
    newlog.dehumidify = _state.dehumidify
    newlog.airpump = _state.airpump
    newlog.circulate = _state.circulate
    newlog.active = _state.active
    newlog.mode = null
    
    //copy loadcells
    var index = 0
    newlog.loadcells = []
    _state.loadcells.forEach(function (cell) {
      newlog.loadcells[index] = cell.load 
      index++
    })

    environmentLogService.createEnvironmentLog(newlog)
    logger.info('Saved Environment Log')
  } catch (error) {
    logger.error('Could not save environment log to DB, Please ensure Mongo is running, Error: ' + error)
    //send notification
  }
}

function processControlBoxData (data) {
  if (!controlBoxService.connected()) return
  logger.warn(data)
  var response = ''
  try {
    response = JSON.parse(data)
  }catch (error) {
    //logger.error('Controlbox Data Parse Error: ' + error)
    return //just return if data is no good.
  }
 
  if (response.type == 'get') {
    switch(response.command) {
      case 'temperature':
        if (response.temperature != 0) { //Eliminate any 0 values they will be a bad sensor read 
          _state.temperature = response.temperature
        }
        break;
      case 'humidity':
        if (response.humidity != 0) { //Eliminate any 0 values they will be a bad sensor read
          _state.humidity = response.humidity / 100
        }
        break;
      case 'light':
        _state.light = response.light
        break;
      case 'cool':
        _state.cool = response.cool
        break;
      case 'heat':
        _state.heat = response.heat
        break;
      case 'humidify':
        _state.humidify = response.humidify
        break;
      case 'dehumidify':
        _state.dehumidify = response.dehumidify
        break;
      case 'airpump':
        _state.airpump = response.airpump
        break;
      case 'circulate':
        _state.circulate = response.circulate
        break;
      case 'isactive':
        _state.isactive = response.isactive
        break;
      case 'loadcells':
        _state.loadcells = response.loadcells
        break;
      case 'state':
        _state.state = response.state
        break;
      case 'settings':
        _state.settings = response.settings
        break;
      default: //must be unknown
        // code block
    }
  } else if (response.command == 'set') {
    switch(response.command) {
      case 'temperaturetarget':
        logger.info('Updated Temperature Target to: ' + _state.temperature )
        break;
      case 'settemperaturevariance':
        logger.info('Set Temperature Variance to: ' + _state.temperaturevariance )
        break;
      case 'sethumiditytarget':
        logger.info('Updated Himidity Target to: ' + _state.humidity )
        break;
      case 'sethumidityvariance':
        logger.info('Set Himidity Variance to: ' + _state.humidityvariance )
        break;
      case 'light':
        logger.info('Set Light State to: ' + _state.light )
        break;
      case 'cool':
        logger.info('Set Cool State to: ' + _state.cool )
        break;
      case 'heat':
        logger.info('Set Heat State to: ' + _state.heat )
        break;
      case 'humidify':
        logger.info('Set Humidify State to: ' + _state.humidify )
        break;
      case 'dehumidify':
        logger.info('Set Dehumidify State to: ' + _state.dehumidify )
        break;
      case 'airpump':
        logger.info('Set Airpump State to: ' + _state.airpump )
        break;
      case 'circulate':
        logger.info('Set Circulate State to: ' + _state.circulate )
        break;
      case 'isactive':
        logger.info('Set Active State to: ' + _state.isactive )
        break;
      default: //must be unknown
        // code block
    }
  } else{ //must be config command
    switch(response.command) {
      case 'tareloadcell':
        // code block
        break;
      case 'calibrateloadcell':
          // code block
        break;
      case 'reset':
          // code block
        break;
      case 'help':
          // code block
        break;
      default: //must be config command
        // code block
    }
  }
}

// function updateTempHumidity (response) { 
//   tempHumiditySensor.read()
//     .then(response => {
//       if (typeof(response) != "undefined"  && typeof (response.sensorerror) == "undefined"){
//         if (mongoose.connection.readyState === 1) {
//           _state.temperature = response.temperature
//         _state.humidity = response.humidity
//         logger.info('Updated Temp & Humidity')
//       } else {
//         var mongostate = mongoose.connection.readyState == 2 ? 'Connecting':'Disconnected'
//         logger.error('Failed to Update Temp & Humidity: Database state = ' + mongostate + ':' + mongoose.connection.readyState )
//       }
//       } else {
//         logger.error('Failed to Update Temp & Humidity: ' + response.sensorerror )
//       }
//     })
// }

// function updateLoadSensors (response) { 
//   loadSensor.read()
//     .then(response => {
//       if (typeof (response) != "undefined" && typeof (response.sensorerror) == "undefined" ) {
//         if (mongoose.connection.readyState === 1) {
//           var index = 0
//           _state.loadcells.forEach(function (cell) {
//             cell.load = response.loadcells[index]
//             index++
//           })
//           logger.info('Updated Load Cells')
//         } else {
//           var mongostate = mongoose.connection.readyState == 2 ? 'Connecting':'Disconnected'
//           logger.error('Failed to Update Load Cells: Database state = ' + mongostate + ':' + mongoose.connection.readyState )
//         }
//       } else {
//         logger.error('Failed to Update Load Cells: ' + response.sensorerror )
//       }
//     })
// }

//save state every minute - at least while testing
var saveStateCron = new CronJob('* * * * *', function() {	saveState() }, null, true);
saveStateCron.start();

//Log Environement every minute
var saveEnvironemntCron = new CronJob('* * * * *', function() {	saveEnvironmentLog() }, null, true);
saveEnvironemntCron.start();

//read humidity & Temp sensor every 30 seconds
var dhtCron = new CronJob('*/30 * * * * *', function () { controlBoxService.command('!get temperature'); controlBoxService.command('!get humidity') }, null, true);
dhtCron.start();

//read load sensors every 15 seconds - at least while testing
// var loadCron = new CronJob('*/15 * * * * *', function() {	updateLoadSensors() }, null, true);
// loadCron.start();


// Configuring port
const port = process.env.PORT || 8081;

const app = express();

// Configure middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors())

// use JWT auth to secure the api
app.use(jwt());

app.set('view engine', 'html');

// Static folder
app.use(express.static(__dirname + '/views/'));

// Defining route middleware
app.use('/api/users', require('./routes/users'));
app.use('/api/logs', require('./routes/environmentlog'));

app.post("/api/state", (req, res) => {
  res.send({
    state: _state
  });
})

app.get("/*", (req, res) => {
  res.send({
    failure: 'No Route ' + req.protocol + '://' + req.get('host') + req.originalUrl
  });
})

// Listening to port
app.listen(port);
logger.info(`Listening On http://localhost:${port}`)

module.exports = app;
