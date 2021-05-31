'use strict'
const logger = require('winston')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
var controlbox
var parser
var connected = false
const reconnectTimeout = 45 * 1000 //Assume we are disconnected from the Controlbox if we hear nothing in reconnectTimeout millseconds.

async function connectControlBox ( dataProcessor ) {
    try {
      
      var path = await findControlBoxPath()
      controlbox = new SerialPort(path, { baudRate: 9600, autoOpen: false })
      

      //Set up Parser
      parser = controlbox.pipe(new Readline())//{ delimiter: '\r' }

      //Set up events
      controlbox.on('open', () => { showPortOpen() })
      
      parser.on('data', (data) => { dataProcessor(data) })
      controlbox.on('close', () => { showPortClose() })
      controlbox.on('error', () => { showError() })
      process.on('uncaughtException', () => { showException() })
      
      open()

      return {started: true}
    } catch (error) {
      connected = false
      logger.error('Control Box not connected: ' + error)
      return {started: false}
    }
  
}
async function findControlBoxPath () {
  const serialList = await SerialPort.list()
  logger.info('Serail List: ')
  logger.info(serialList)

  var vendorId = process.env.CONTROLBOX_VENDOR_IDS.split(' ')
  logger.info('Arduino ControlBox Vendor ID: ' + vendorId)


  const { path } = serialList.find(port => vendorId.includes(port.vendorId))
  logger.info('Found Control Box connected at port: ' + path)
  return path
}

function open () {
  logger.info('Controlbox Port Opening . . .')
  controlbox.open(  (err) => {
    if (!err) {
      connected = true
      logger.info('Controlbox Port Open')
      return
    }
    logger.info('Controlbox Port Failed To Open: ' + err.message);
    setTimeout(open, 10000); // next attempt to open after 10s
  });
}

function command (command) {
  if (connected) {
    try {
      controlbox.write(command + "\r\n")//must have a newline character to get Arduino to parse it
      logger.info('Sent Command: ' + command)
    } catch (error) {
      logger.error('Error sending command: ' + command + ', Error:' + error)
    }
  } else {
    logger.error('Cannot Send Command: ' + command + ', Controlbox not Connected')
  }
}

function showPortOpen() {
  logger.info('ControlBox port open. Data rate: ' + controlbox.baudRate)
}
 
function showPortClose() {
  logger.error('ControlBox Port Closed')
  open()
}
 
function showError(error) {
  logger.info('ControlBox Error: ' + error)
}

function showException(error) {
  logger.info('ControlBox Error: ' + error)
}

function isConnected () {
  return connected
}

module.exports = {
  connectControlBox: connectControlBox,
  command: command,
  showPortOpen: showPortOpen,
  showPortClose: showPortClose,
  showError: showError,
  connected: isConnected
} 

// SerialCommandHandler.AddCommand(F("help"), Cmd_Help)
// SerialCommandHandler.AddCommand(F("get"), Cmd_Get)
// SerialCommandHandler.AddCommand(F("set"), Cmd_Set)
// //3
 
// SerialCommandHandler.AddCommand(F("tareloadcell"), Cmd_TareLoadCell)
// SerialCommandHandler.AddCommand(F("calibrateloadcell"), Cmd_CalibrateLoadCell)
// //5

// SerialCommandHandler.AddCommand(F("resetbox"), Cmd_Reset)
  
//commands["!set temperaturetarget 10"] = "Sets the Target Temperature"
//commands["!set temperaturevariance 2"] = "Sets Target +/- Variance"
//commands["!set humiditytarget 75"] = "Sets the Target Humidity 0-100"
//commands["!set humidityvariance 5"] = "Sets the Humidity +/- % Variance 0-25"
//
//commands["!set light 0"] = "Sets the current light state, on[1] or off[0]"
//commands["!set cool 0"] = "Sets the current cool state, on[1] or off[0]"
//commands["!set heat 0"] = "Sets the current heat state, on[1] or off[0]"
//commands["!set humidify 0"] = "Sets the current humidify state, on[1] or off[0]"
//commands["!set dehumidify 0"] = "Sets the current dehumidify state, on[1] or off[0]"
//commands["!set airpump 0"] = "Sets the current airpump state, on[1] or off[0]"
//commands["!set circulate 0"] = "Sets the current circulate state, on[1] or off[0]"
//commands["!set isactive 0"] = "Sets the current isactive state, on[1] or off[0]"
//
//commands["!get temperature"] = "Gets the current temperature in degrees"
//commands["!get humidity"] = "Gets the current humidity in RH%"
//commands["!get light"] = "Gets the current light state, true or false"
//commands["!get cool"] = "Gets the current cool state, true or false"
//commands["!get heat"] = "Gets the current heat state, true or false"
//commands["!get humidify"] = "Gets the current humidify state, true or false"
//commands["!get dehumidify"] = "Gets the current dehumidify state, true or false"
//commands["!get airpump"] = "Gets the current airpump state, true or false"
//commands["!get circulate"] = "Gets the current circulate state, true or false"
//commands["!get isactive"] = "Gets the current isactive state, true or false"
//commands["!get resetbox"] = "Resets/Restarts the Box Controller"




