// Importing required modules
const express = require('express')
const cors = require('cors')
const bodyParser = require("body-parser")
const jwt = require('./helpers/jwt')

const multer = require("multer")
const path = require("path")
const fs = require("fs")

const stateService = require('./services/state.service')
const environmentLogService = require('./services/environmentlog.service')
const controlBoxService = require('./services/controlbox.service')

var mongoose = require('mongoose');

// parse env variables
require('dotenv').config()
const logger = require('./helpers/logger.js'); 

var CronJob = require('cron').CronJob;

require("./helpers/db/mongodb.js")()

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
controlBoxService.connectControlBox().then(response => {
  console.log("response")
  console.log(response)
  if (response.connected) {
    logger.info("Control Box Service Started")
  } else {
    logger.error('Could not start Control Box Service.')
  }
})

//sensors
const tempHumiditySensor = require('./sensors/temp_humidity_sensor')
const loadSensor = require('./sensors/load_sensor')
const { Console } = require('console')

function saveState () {
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
  } catch (err) {
    console.log(err)
    logger.error('Could not save environment log to DB, Please ensure Mongo is running.')
    //send notification
  }
}
  

function updateTempHumidity (response) { 
  tempHumiditySensor.read()
    .then(response => {
      if (typeof(response) != "undefined"  && typeof (response.sensorerror) == "undefined"){
        if (mongoose.connection.readyState === 1) {
          _state.temperature = response.temperature
        _state.humidity = response.humidity
        logger.info('Updated Temp & Humidity')
      } else {
        var mongostate = mongoose.connection.readyState == 2 ? 'Connecting':'Disconnected'
        logger.error('Failed to Update Temp & Humidity: Database state = ' + mongostate + ':' + mongoose.connection.readyState )
      }
      } else {
        logger.error('Failed to Update Temp & Humidity: ' + response.sensorerror )
      }
    })
}

function updateLoadSensors (response) { 
  loadSensor.read()
    .then(response => {
      if (typeof (response) != "undefined" && typeof (response.sensorerror) == "undefined" ) {
        if (mongoose.connection.readyState === 1) {
          var index = 0
          _state.loadcells.forEach(function (cell) {
            cell.load = response.loadcells[index]
            index++
          })
          logger.info('Updated Load Cells')
        } else {
          var mongostate = mongoose.connection.readyState == 2 ? 'Connecting':'Disconnected'
          logger.error('Failed to Update Load Cells: Database state = ' + mongostate + ':' + mongoose.connection.readyState )
        }
      } else {
        logger.error('Failed to Update Load Cells: ' + response.sensorerror )
      }
    })
}

//save state every minute - at least while testing
var saveStateCron = new CronJob('* * * * *', function() {	saveState() }, null, true);
saveStateCron.start();

//Log Environement every minute
var saveEnvironemntCron = new CronJob('* * * * *', function() {	saveEnvironmentLog() }, null, true);
saveEnvironemntCron.start();

//read humidity & Temp sensor every 10 seconds - at least while testing
var dhtCron = new CronJob('*/10 * * * * *', function () { updateTempHumidity() }, null, true);
dhtCron.start();

//read load sensors every 15 seconds - at least while testing
var loadCron = new CronJob('*/15 * * * * *', function() {	updateLoadSensors() }, null, true);
loadCron.start();


// Configuring port
const port = process.env.PORT || 8081;

const app = express();

// Configure middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
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
