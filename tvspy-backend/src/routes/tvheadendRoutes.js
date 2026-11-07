const express = require('express');
const router = express.Router();
const tvheadendController = require('../controllers/tvheadendController');

router.get('/channel', (req, res) => tvheadendController.getChannels(req, res));
router.get('/subscriptions', (req, res) => tvheadendController.getSubscriptions(req, res));
router.get('/users', (req, res) => tvheadendController.getUsers(req, res));
router.post('/subscriptions/cancel', (req, res) => tvheadendController.cancelSubscription(req, res));
router.get('/tvheadend/status', (req, res) => tvheadendController.getStatus(req, res));
router.get('/tvheadend/diskspace', (req, res) => tvheadendController.getDiskSpace(req, res));
router.get('/tvheadend/epg/current', (req, res) => tvheadendController.getCurrentEpg(req, res));
router.get('/tvheadend/dvr/upcoming', (req, res) => tvheadendController.getDvrUpcoming(req, res));

module.exports = router;
