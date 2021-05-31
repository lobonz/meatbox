'use strict';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user_schema');

async function getAllUsers() {
  return await User.find().select('-hash')
}

async function checkDefaultUser () {
  this.getAllUsers().then(
    users => {
      if (users.length == 0) {
          this.createUser({name: 'meatbox', username: 'meat', email: 'meat@myhouse.co.nz', password: 'charcoal'})
        }
      }
  ).catch(err => next(err));
}

async function createUser(userParam) {
  // validate
  if (await User.findOne({ username: userParam.username })) {
      throw 'Username "' + userParam.username + '" is already taken';
  }

  const user = new User(userParam);

  // hash password
  if (userParam.password) {
      user.hash = bcrypt.hashSync(userParam.password, 10);
  }

  // save user
  await user.save();
  return { userid: user._id }
}

async function readUser(id) {
  const user = await User.findById(id).select('-hash');
  const token = jwt.sign({ sub: user.id }, process.env.SECRET);
  //console.log(token)

  //used to generate an API key to use in SW macros
  //user.apitoken = token
  // save user
  //await user.save();

  return user
}

async function updateUser(id, userParam) {
  const user = await User.findById(id);

  // validate
  if (!user) throw 'User not found';
  if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
      throw 'Username "' + userParam.username + '" is already taken';
  }

  // hash password if it was entered
  if (userParam.password) {
      userParam.hash = bcrypt.hashSync(userParam.password, 10);
  }

  // copy userParam properties to user
  Object.assign(user, userParam);

  await user.save();
}

async function deleteUser(id) {
  await User.findByIdAndRemove(id);
}

async function authenticateUser({ email, password }) {
  email = String(email).toLowerCase()
  //console.log (email)
  const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') })
  //console.log (user.email)
  if (user && bcrypt.compareSync(password, user.hash)) {

      const { hash, ...userWithoutHash } = user.toObject();
      //console.log(process.env.SECRET)
      const token = jwt.sign({ sub: user.id }, process.env.SECRET);
      return {
          ...userWithoutHash,
          token
      };
  }
}

module.exports = {
  getAllUsers,
  createUser,
  readUser,
  updateUser,
  deleteUser,
  authenticateUser,
  checkDefaultUser
};
