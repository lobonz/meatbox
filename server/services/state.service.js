'use strict';
const logger = require('winston');
const State = require('../models/state_schema');

async function createState() {
  // Creates initial State
  const state = new State({});
  
  state.active = false
  state.mode = null
  state.temperature = 0
  state.humidity = 0
  state.light = false
  state.cool = false
  state.heat = false
  state.humidify = false
  state.dehumidify = false
  state.airpump = false
  state.circulate = false
  state.loadcells = [{ load: 0, label: '' },{ load: 1, label: '' },{ load: 2, label: '' },{ load: 3, label: '' }]
  
    // save state
    await state.save();
    return { stateid: state._id }
  }

async function readState () {
  try {
    var state = await State.find({})
    if (state.length < 1) {
      this.createState()
      state = await State.find({})
    }
    return state[0]
  } catch(error) {
    logger.error("state.service.js " + error);
  }
}

module.exports = {
  createState,
  readState
};
