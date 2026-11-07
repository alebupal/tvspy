const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

router.get('/config', (req, res) => configController.getAll(req, res));
router.post('/config/multiple', (req, res) => configController.getMultiple(req, res));
router.put('/config/bulk', (req, res) => configController.updateMultiple(req, res));
router.post('/config/test-tvheadend', (req, res) => configController.testTvheadend(req, res));
router.post('/config/test-telegram', (req, res) => configController.testTelegram(req, res));
router.post('/config/test-webhook', (req, res) => configController.testWebhook(req, res));
router.get('/config/pin-status', (req, res) => configController.getPinStatus(req, res));
router.post('/config/verify-pin', (req, res) => configController.verifyPin(req, res));

router.get('/config/:name', (req, res) => configController.getByName(req, res));
router.put('/config/:name', (req, res) => configController.update(req, res));
router.post('/config', (req, res) => configController.update(req, res));

module.exports = router;
