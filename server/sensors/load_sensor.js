'use strict';
const axios = require('axios');
var logger = require('winston'); 

//wrapper for reading the load cells 
//faked for now but will use this module for production:
//https://github.com/dangrie158/opencushion#readme

function read () {
  return axios.get(process.env.DEVSENSORSIMULATOR + '/state')
  .then(response => {
    return response.data.environment
  })
    .catch(error => {
      //console.log('load_sensor.js')
      logger.error("load_sensor.js " + error);
      return { sensorerror: 'Could not get Load Sensor Data' }
  });
}
module.exports = {
  read
};

