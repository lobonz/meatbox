var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var StateSchema = new Schema({
  active: Boolean,
  mode: { type: Schema.Types.ObjectId, ref: 'mode' },
  temperature: Number,
  humidity: Number,
  light: Boolean,
  cool: Boolean,
  heat: Boolean,
  humidify: Boolean,
  dehumidify: Boolean,
  airpump: Boolean,
  circulate: Boolean,
  loadcells: [{load: Number, label: String}]
});

var State = mongoose.model("State", StateSchema);
module.exports = State;