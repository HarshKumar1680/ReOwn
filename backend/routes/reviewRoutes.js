const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Add a review (auth required)
router.post('/', protect, reviewController.addReview);

// Get all reviews for a product
router.get('/:productId', reviewController.getReviews);

module.exports = router; 