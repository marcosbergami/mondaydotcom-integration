const express = require('express');
const router = express.Router();
const customController = require('../controllers/custom-controller.js');
const authenticationMiddleware = require('../middlewares/authentication').authenticationMiddleware;
router.post('/demo/email_update', authenticationMiddleware, customController.executeAction);
module.exports = router;
