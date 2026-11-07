const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

router.get('/statistics/general', (req, res) => statisticsController.getGeneral(req, res));

module.exports = router;
