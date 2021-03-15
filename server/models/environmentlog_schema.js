var mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

var Schema = mongoose.Schema;

var environmentLogSchema = new Schema({
  temperature: Number,
  humidity: Number,
  light: Boolean,
  cool: Boolean,
  heat: Boolean,
  humidify: Boolean,
  dehumidify: Boolean,
  airpump: Boolean,
  circulate: Boolean,
  loadcells: [Number],
  mode: { type: Schema.Types.ObjectId, ref: 'mode' },
  active: Boolean
},
{//Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

environmentLogSchema.plugin(mongoosePaginate);

var environmentLog = mongoose.model("environmentLog", environmentLogSchema);
module.exports = environmentLog;
