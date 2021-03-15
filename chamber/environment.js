let jsoning = require('jsoning');
//reload state

class environment {
  constructor() {
    this.db = new jsoning(__dirname + "\\environmentDB.json");
    Number.prototype.map = function (in_min, in_max, out_min, out_max) {
      return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
    this.last_update = 0;
  }
  async load () { 
    if (! await this.db.has("temperature")) {
      this.db.set("temperature", 10)
      this.db.set("humidity", 60)
      this.db.set("light", false)
      this.db.set("cool", false)
      this.db.set("heat", false)
      this.db.set("humidify", false)
      this.db.set("dehumidify", false)
      this.db.set("airpump", false)
      this.db.set("circulate", false)
      this.db.set("loadcells", [0,0,0,0])
    }
  }
  async update () {
    console.clear()

    const max_temp = 25;//midday
    const min_temp = 12;//midnight

    const max_humidity = .9;//midnight
    const min_humidity = .6;//midday

    const fridge_second_delta = 4 / (1*60*60); //4 degrees per hour
    const fridge_second_cool_delta = 20 / (4*60*60); //cool ~20 degrees in 4 hours
    
    const heater_second_delta = 10 / (1*60*60); //10 degrees per hour
    
    const humidifier_second_delta = 1 / (1 * 60 * 60); //100 percent per hour I assume this will be fast given the small space
    const dehumidifier_second_delta = .2 / (1 * 60 * 60); //20 percent per hour I assume this will be slower - a complete guess
    
    const airpump_temperature_second_delta = .1 / (1 * 60 ); //10 percent of the difference per minute - a complete guess
    const airpump_humidity_second_delta = .1 / (1 * 60 ); //10 percent of the difference per minute  - a complete guess
    
    const drying_second_delta = .01 /  ( 24 * 60 * 60 ); //Meat dries Approc 1% a day at least for testing

    //get normal distribution for this hour
    const date = new Date();
    const seconds_in_a_day = 60*60*24;

    var ambient_humidity = min_humidity + ((max_humidity - min_humidity) * (1 - plotOnBell(1 / seconds_in_a_day * getSecondsToday())));
    //ambient_humidity = ambient_humidity.toFixed(2);
    var ambient_temp = min_temp + ((max_temp - min_temp) * plotOnBell(1 / seconds_in_a_day * getSecondsToday()));
    //ambient_temp = ambient_temp.toFixed(2);
    //console.log(plotOnBell(1 / seconds_in_a_day * getSecondsToday()))
    //This was from this graph "input/Relationship+between+air+temperature+and+relative+humidity.jpg"
    const temp_humidity_rel_factor = 5 / 100 //for every degree the temp rises humidiy drop 5 times as a percent

    const current_millis = new Date().getTime();
    if (this.last_update === 0) {
      this.last_update = current_millis;
      return //return and wait to update values if this is the first run to see how long between updates.
    }

    var time_delta = Math.round((current_millis - this.last_update)/1000); //seconds between updates

    //adjust environment - temp and humiidty
    var new_temp = await this.db.get("temperature")
    var new_humidity = await this.db.get("humidity")

    //If fridge is on lower temp & increase humidity
    if (await this.db.get('cool')) {
      const temp_change = time_delta * fridge_second_cool_delta
      const humidity_change = (temp_humidity_rel_factor * temp_change)

      //adjust temp
      new_temp = new_temp - temp_change
      //adjust humidity
      new_humidity = new_humidity + humidity_change

      console.log('Fridge on Cooling by ' + temp_change + ', increasing Humidity by ' + humidity_change )
    }
    
    

    //If heater is on increase temp & decrease humidity
    if (await this.db.get('heat')) {
      const temp_change = time_delta * heater_second_delta
      const humidity_change = (temp_humidity_rel_factor * temp_change)
      new_temp = new_temp + temp_change
      //adjust humidity
      new_humidity = new_humidity - humidity_change
      //console.log('heat = ' + await this.db.get('heat'))

      console.log('Heater on Heating by ' + temp_change + ', increasing Humidity by ' + humidity_change )
    }

    {
      //Adjust for ambient temperature
      //A Fridge will warm approx 4 degrees per hour
      const temp_change = (time_delta * fridge_second_delta)
      const humidity_change = (temp_humidity_rel_factor * temp_change)
      if (new_temp > ambient_temp) {
        new_temp = new_temp - temp_change
        new_humidity = new_humidity + humidity_change
      } else {
        new_temp = new_temp + temp_change
        new_humidity = new_humidity - humidity_change
      }

      console.log('Adjusting for Ambient Environment, Heating by ' + temp_change + ', increasing Humidity by ' + humidity_change )
    }
    
    //If Humidifier is on increase Humidity
    if (await this.db.get('humidify')) {
      const humidity_change = time_delta * humidifier_second_delta
      //adjust humidity
      new_humidity = new_humidity + humidity_change

      console.log('Humidifier on, increasing Humidity by ' + humidity_change )
    }

    //If Dehumidifier is on decrease Humidity
    if (await this.db.get('dehumidify')) {
      const humidity_change = time_delta * dehumidifier_second_delta
      //adjust humidity
      new_humidity = new_humidity - humidity_change

      console.log('Dehumidifier on, decreasing Humidity by ' + humidity_change )
    }

    //If airpump is on adjust temperature/humidity based on outside temperature/humidity
    if (await this.db.get('airpump')) {
      const temp_diff = ambient_temp - new_temp 
      const humidity_diff = ambient_humidity - new_humidity
      const temp_change = temp_diff * airpump_temperature_second_delta
      const humidity_change = humidity_diff * airpump_humidity_second_delta
      //adjust humidity & temp
      new_humidity = new_humidity - humidity_change
      new_temp = new_temp - temp_change
      console.log('Airpump on Adjusting Temperature by ' + temp_change + ', Adjusting Humidity by ' + humidity_change + ' ' + new_humidity + ' ' + ambient_humidity)
    }

    //Decrease loadcells ~1% per day
    var loadcells = await this.db.get("loadcells")
    loadcells[0] = loadcells[0] - (loadcells[0] * drying_second_delta)
    loadcells[1] = loadcells[1] - (loadcells[1] * drying_second_delta)
    loadcells[2] = loadcells[2] - (loadcells[2] * drying_second_delta)
    loadcells[3] = loadcells[3] - (loadcells[3] * drying_second_delta)
    await this.db.set("loadcells", loadcells)
    console.log('Adjusting Load Cells 1,2,3,4 by ' + (loadcells[0] * drying_second_delta) + ', ' + (loadcells[1] * drying_second_delta) + ', ' + (loadcells[2] * drying_second_delta) + ', ' + (loadcells[3] * drying_second_delta))

    if (new_humidity > 1) { new_humidity = 1 }
    if (new_humidity < .3) { new_humidity = .3 }

    this.setTemperature(new_temp)
    this.setHumidity(new_humidity)

    console.log("Updating every: " + time_delta + " seconds")
    console.log("Ambient Temperature: " + ambient_temp)
    console.log("Ambient Humidity: " + ambient_humidity)
    console.log(await this.db.all());
    
    this.last_update = current_millis;
  }

  async getState (state) {
    return await this.db.all()
  }

  async setHeat (state) {
    await this.db.set("heat", state)
  }

  async setCool (state) {
    await this.db.set("cool", state)
  }

  async setTemperature (value) {
    await this.db.set("temperature", parseFloat(value))
  }

  async setHumidity (value) {
    await this.db.set("humidity", parseFloat(value))
  }

  async setLight (state) {
    await this.db.set("light", state)
  }

  async setHumidify (state) {
    await this.db.set("humidify", state)
  }

  async setDehumidify (state) {
    await this.db.set("dehumidify", state)
  }

  async setAirpump (state) {
    await this.db.set("airpump", state)
  }

  async setCirculate (state) {
    await this.db.set("circulate", state)
  }
  
  async setLoadcell (cell, load) {
    var loadcells = await this.db.get("loadcells")
    loadcells[cell - 1] = parseInt(load) //grams
    await this.db.set("loadcells", loadcells)
  }

  async getLoadcell (cell) {
    var loadcells = await this.db.get("loadcells")
    //console.log(loadcells)
    return loadcells[cell - 1]
  }

}

module.exports = environment;

// https://www.w3schools.com/code/tryit.asp?filename=GNO2RIP78H1V

function plotOnBell (x, scale) {
  //This returns values along a bell curve from 0 - 1 - 0 with an input of 0 - 1.
  scale = scale || false;
  var stdD = .125
  var mean = .5
  if(scale){
    return  1 / (( 1/( stdD * Math.sqrt(2 * Math.PI) ) ) * Math.pow(Math.E , -1 * Math.pow(x - mean, 2) / (2 * Math.pow(stdD,2))));
  }else{
     return (( 1/( stdD * Math.sqrt(2 * Math.PI) ) ) * Math.pow(Math.E , -1 * Math.pow(x - mean, 2) / (2 * Math.pow(stdD,2)))) * plotOnBell(.5,true);
  }
}

function getSecondsToday() {
  let d = new Date();
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
}