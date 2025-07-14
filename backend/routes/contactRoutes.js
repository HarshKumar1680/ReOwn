const express = require('express');
const router = express.Router();
const { submitContactMessage } = require('../controllers/contactController');

// POST /api/contact
router.post('/', submitContactMessage);

module.exports = router; 