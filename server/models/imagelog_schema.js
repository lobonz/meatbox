var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var imageLogSchema = new Schema({
  date: Date,
  image: String
},
{//Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

var imageLog = mongoose.model("imageLog", imageLogSchema);
module.exports = imageLog;
