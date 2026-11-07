const express = require('express');
const router = express.Router();
const tvheadendController = require('../controllers/tvheadendController');

router.get('/channel', (req, res) => tvheadendController.getChannels(req, res));
router.get('/subscriptions', (req, res) => tvheadendController.getSubscriptions(req, res));
router.get('/users', (req, res) => tvheadendController.getUsers(req, res));
router.post('/subscriptions/cancel', (req, res) => tvheadendController.cancelSubscription(req, res));
router.get('/tvheadend/status', (req, res) => tvheadendController.getStatus(req, res));

module.exports = router;
