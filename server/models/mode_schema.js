var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var ModeSchema = new Schema({
  title: String,
  description: String,
  temperature: {
    goal: 10,
    min: 8,
    max: 12,
    cool_min_idle: 10,
    heat_min_idle: 10
  },
  humidity: {
    goal: .8,
    min: .75,
    max: .85,
    humidify_min_idle: 10,
    dehumidify_min_idle: 10
  }
},
{//Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

var Mode = mongoose.model("Mode", ModeSchema);
module.exports = Mode;