// Importing required modules

const express = require('express');
const cors = require('cors');


const Environment = require('./environment');
const environment = new Environment();
environment.load() //Load Environment from json database

// parse env variables
require('dotenv').config();


var CronJob = require('cron').CronJob;


//update environment every 15seconds
var updateEnvironmentCron = new CronJob('*/5 * * * * *', function () {
	environment.update()
}, null, true);
updateEnvironmentCron.start();


// Configuring port
const port = process.env.PORT || 8082;

const app = express();

// Configure middlewares
app.use(cors());
app.use(express.json());
app.use(cors())

app.set('view engine', 'html');

app.get('/state', async (req, res) => {
  res.send({
    success: 'Environment State',
    environment: await environment.getState()
  });
})

app.get('/heat/:state', async (req, res) => {
  if (req.params.state == "on" || req.params.state == "1" || req.params.state == true) {
    environment.setHeat(true)
  } else {
    environment.setHeat(false)
  }
  res.send({
    success: 'Heat: ' + await environment.db.get('heat')
  });
})

app.get('/cool/:state', async (req, res) => {
  if (req.params.state == "on" || req.params.state == "1" || req.params.state == true) {
    environment.setCool(true)
  } else {
    environment.setCool(false)
  }
  res.send({
    success: 'Cool:' + await environment.db.get('cool')
  });
})

app.get('/temperature/:value', async (req, res) => {
  await environment.setTemperature(req.params.value)
  res.send({
    success: 'Temperature: ' + await environment.db.get('temperature')
  });
})

app.get('/humidity/:value', async (req, res) => {
  await environment.setHumidity(req.params.value)
  res.send({
    success: 'Humidity: ' + await environment.db.get('humidity')
  });
})

app.get('/light/:state', async (req, res) => {
  if (req.params.state == "on" || req.params.state == "1" || req.params.state == true) {
    await environment.setLight(true)
  } else {
    await environment.setLight(false)
  }
  res.send({
    success: 'Light:' + await environment.db.get('light')
  });
})

app.get('/humidify/:state', async (req, res) => {
  if (req.params.state == "on" || req.params.state == "1" || req.params.state == true) {
    await environment.setHumidify(true)
  } else {
    await environment.setHumidify(false)
  }
  res.send({
    success: 'Humidify:' + await environment.db.get('humidify')
  });
})

app.get('/dehumidify/:state', async (req, res) => {
    if (req.params.state == "on" || req.params.state == "1" || req.params.state == true) {
      await environment.setDehumidify(true)
    } else {
      await environment.setDehumidify(false)
    }
    res.send({
      success: 'Dehumidify:' + await environment.db.get('dehumidify')
    });
})

app.get('/airpump/:state', async (req, res) => {
    if (req.params.state == "on" || req.params.state == "1" || req.params.state == true) {
      await environment.setAirpump(true)
    } else {
      await environment.setAirpump(false)
    }
    res.send({
      success: 'Airpump:' + await environment.db.get('airpump')
    });
})

app.get('/circulate/:state', async (req, res) => {
    if (req.params.state == "on" || req.params.state == "1" || req.params.state == true) {
      await environment.setCirculate(true)
    } else {
      await environment.setCirculate(false)
    }
    res.send({
      success: 'Circulate:' + await environment.db.get('circulate')
    });
})

app.get('/loadcell/:cell', async (req, res) => {
  res.send({
    success: 'Load Cell #'+req.params.cell+': ' + await environment.getLoadcell(req.params.cell)
  });
})

app.get('/loadcell/:cell/:value', async (req, res) => {
  await environment.setLoadcell(req.params.cell,req.params.value)
  res.send({
    success: 'Load Cell #'+req.params.cell+': ' + await environment.getLoadcell(req.params.cell)
  });
})

app.get("/*", (req, res) => {
  res.send({
    failure: 'No Such Route:' + req.originalUrl
  });
})

// Listening to port
app.listen(port);
console.log(`Listening On http://localhost:${port}`);

module.exports = app;
