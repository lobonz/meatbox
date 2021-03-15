const express = require('express');

const userService = require('../services/user.service');

const router = express.Router();

router
  .post('/create', createUser)
  .get('/read/:id', readUser)
  .put('/update/:id', updateUser)
  .post('/delete', deleteUser)
  .post('/authenticate', authenticateUser)
  .get('/', getAllUsers)

module.exports = router;

function authenticateUser(req, res, next) {
  userService.authenticateUser(req.body)
      .then(user => user ? res.json(user) : res.status(400).json({ success: false, message: 'Username or password is incorrect' }))
      .catch(err => next(err));
}

function createUser(req, res, next) {
  userService.createUser(req.body)
      .then(user => res.json(user))
      .catch(err => next(err));
}

function getAllUsers(req, res, next) {
  userService.getAllUsers()
      .then(users => res.json(users))
      .catch(err => next(err));
}

function readUser(req, res, next) {
  userService.readUser(req.params.id)
      .then(user => user ? res.json(user) : res.sendStatus(404))
      .catch(err => next(err));
}

function updateUser(req, res, next) {
  userService.updateUser(req.params.id, req.body)
      .then(() => res.json({}))
      .catch(err => next(err));
}

function deleteUser(req, res, next) {
  userService.delete(req.params.id)
      .then(() => res.json({}))
      .catch(err => next(err));
}
