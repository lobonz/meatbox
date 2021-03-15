'use strict';
const axios = require('axios');
var logger = require('winston'); 

//wrapper for reading the temperature and humidity 
//faked for now but will use this module for production:
//https://www.npmjs.com/package/node-dht-sensor

function read () {
  return axios.get(process.env.DEVSENSORSIMULATOR + '/state')
  .then(response => {
    return response.data.environment
  })
    .catch(error => {
      //console.log('temphumidity_sensor.js')
      logger.error("temp_humidity_sensor.js " + error);
      return { sensorerror: 'Could not get Temp & Humidity Sensor Data' }
  });
}
module.exports = {
  read
};
