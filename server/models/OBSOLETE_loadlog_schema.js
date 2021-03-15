var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var loadLogSchema = new Schema({
  date: Date,
  loadCells: [ Number ]
},
{//Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

var loadLog = mongoose.model("loadLog", loadLogSchema);
module.exports = loadLog;
