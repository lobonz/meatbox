'use strict';
const logger = require('winston');
var SerialPort = require('serialport');
var controllbox;
    
async function connectControlBox () {
    try {
      const serialList = await SerialPort.list();
      console.log(serialList);
      var vendorId = process.env.CONTROLBOX_VENDOR_IDS.split(' ');
      console.log(vendorId);

      const { path } = serialList.find(port => vendorId.includes(port.vendorId));
      console.log("path");
      console.log(path);
      controllbox = new SerialPort(path, { baudRate: 9600 });
      logger.info('Control Box connected at port: ' + path)
      return {connected: true}
    } catch (error) {
      logger.error('Control Box not connected: ' + error)
      return {connected: false}
    }
  
}

module.exports = {
  connectControlBox
};




