const express = require('express');

const environmentlogService = require('../services/environmentlog.service');

const router = express.Router();

router
  .post("/read", readEnvironmentLog)
  
module.exports = router;

function readEnvironmentLog (req, res, next) {
  environmentlogService.readEnvironmentLog(req.body)
    .then(logs => res.json(logs))
      .catch(err => next(err));
}
