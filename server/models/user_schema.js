var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const Bcrypt = require("bcryptjs");

var UserSchema = new Schema({
  name: { type: String, required: true },
  hash: { type: String, required: true },
  email: { type: String, unique: true, required: true },
},
{//Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

UserSchema.pre("save", function(next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = Bcrypt.hashSync(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function(plaintext, callback) {
  return callback(null, Bcrypt.compareSync(plaintext, this.password));
};

var User = mongoose.model("User", UserSchema);
module.exports = User;

// https://www.thepolyglotdeveloper.com/2019/02/hash-password-data-mongodb-mongoose-bcrypt/
