const express = require('express');
const router = express.Router();
const registryController = require('../controllers/registryController');

router.get('/registries', (req, res) => registryController.list(req, res));
router.get('/registries/user/:username/summary', (req, res) => registryController.getUserSummary(req, res));
router.get('/registries/:id', (req, res) => registryController.getById(req, res));
router.post('/registries', (req, res) => registryController.create(req, res));
router.put('/registries/:id', (req, res) => registryController.update(req, res));

module.exports = router;
