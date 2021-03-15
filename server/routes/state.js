const express = require('express');

const stateService = require('../services/state.service');

const router = express.Router();

router
  .get('/read/:id', readState)
  .put('/update/:id', updateState)

module.exports = router;

// There is only one state, it gets created automatically if it does not exist

function readState(req, res, next) {
  stateService.readState(req.params.id)
      .then(state => state ? res.json(state) : res.sendStatus(404))
      .catch(err => next(err));
}

function updateState(req, res, next) {
  stateService.updateState(req.params.id, req.body)
      .then(() => res.json({}))
      .catch(err => next(err));
}

function deleteState(req, res, next) {
  stateService.delete(req.params.id)
      .then(() => res.json({}))
      .catch(err => next(err));
}
